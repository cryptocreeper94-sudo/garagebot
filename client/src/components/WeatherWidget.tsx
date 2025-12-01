import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Cloud, Sun, CloudRain, Wind, Droplets, ThermometerSun, 
  MapPin, RefreshCw, Settings, ChevronRight, Loader2,
  Navigation, Eye, Gauge, Radar
} from "lucide-react";
import WeatherRadar from "./WeatherRadar";

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

interface UserPreferences {
  weatherZip?: string;
  weatherCity?: string;
  temperatureUnit?: 'F' | 'C';
}

export default function WeatherWidget() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [zipInput, setZipInput] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [localZip, setLocalZip] = useState<string | null>(null);
  const [showRadar, setShowRadar] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const { data: preferences } = useQuery<UserPreferences>({
    queryKey: ["/api/user/preferences"],
    enabled: !!user,
  });

  const effectiveZip = preferences?.weatherZip || localZip || "10001";

  const { data: weather, isLoading, error, refetch } = useQuery<WeatherData>({
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

  const savePreferences = useMutation({
    mutationFn: async (prefs: Partial<UserPreferences>) => {
      const res = await fetch("/api/user/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prefs)
      });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/preferences"] });
      queryClient.invalidateQueries({ queryKey: ["/api/weather/zip"] });
      toast({ title: "Location Saved", description: "Your weather location has been updated" });
      setSettingsOpen(false);
    }
  });

  const handleSetLocation = () => {
    if (zipInput.length >= 5) {
      if (user) {
        savePreferences.mutate({ weatherZip: zipInput });
      } else {
        setLocalZip(zipInput);
        localStorage.setItem('weatherZip', zipInput);
        queryClient.invalidateQueries({ queryKey: ["/api/weather/zip"] });
        toast({ title: "Location Set", description: "Weather location updated" });
        setSettingsOpen(false);
      }
    }
  };

  useEffect(() => {
    if (!user) {
      const stored = localStorage.getItem('weatherZip');
      if (stored) setLocalZip(stored);
    }
  }, [user]);

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 p-6 min-h-[200px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </Card>
    );
  }

  if (error || !weather) {
    return (
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 p-6">
        <div className="text-center">
          <Cloud className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-muted-foreground text-sm mb-4">Weather unavailable</p>
          <div className="flex gap-2 justify-center">
            <Input 
              placeholder="Enter ZIP" 
              value={zipInput}
              onChange={(e) => setZipInput(e.target.value)}
              className="w-24 text-center"
              data-testid="input-weather-zip-error"
            />
            <Button size="sm" onClick={handleSetLocation} data-testid="button-set-location-error">
              <MapPin className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-primary/5 via-transparent to-primary/10 border-primary/20 overflow-hidden" data-testid="weather-widget">
      <div className="p-4 md:p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            <div>
              <h3 className="font-tech uppercase text-sm" data-testid="text-weather-location">
                {weather.location.city}{weather.location.state ? `, ${weather.location.state}` : ''}
              </h3>
              <p className="text-xs text-muted-foreground font-mono">{weather.current.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className={`h-8 w-8 relative ${showRadar ? 'text-primary' : ''}`}
              onClick={() => setShowRadar(!showRadar)}
              data-testid="button-toggle-radar"
            >
              <Radar className="w-4 h-4" />
              {showRadar && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-primary rounded-full animate-pulse" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => refetch()} data-testid="button-refresh-weather">
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Popover open={settingsOpen} onOpenChange={setSettingsOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" data-testid="button-weather-settings">
                  <Settings className="w-4 h-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64" align="end">
                <div className="space-y-3">
                  <h4 className="font-tech uppercase text-xs text-muted-foreground">Change Location</h4>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="ZIP Code" 
                      value={zipInput}
                      onChange={(e) => setZipInput(e.target.value)}
                      className="font-mono"
                      data-testid="input-weather-zip-settings"
                    />
                    <Button onClick={handleSetLocation} disabled={zipInput.length < 5} data-testid="button-save-location">
                      Save
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="flex items-center gap-6 mb-6">
          <div className="text-center">
            <span className="text-5xl md:text-6xl">{weather.current.icon}</span>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl md:text-6xl font-tech font-bold" data-testid="text-current-temp">{weather.current.temp}</span>
              <span className="text-2xl text-muted-foreground">°F</span>
            </div>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <ThermometerSun className="w-4 h-4" /> 
              Feels like {weather.current.feelsLike}°
            </p>
          </div>
        </div>

        <AnimatePresence>
          {showRadar && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-6"
            >
              <WeatherRadar
                lat={weather.location.lat}
                lon={weather.location.lon}
                onClose={() => setShowRadar(false)}
                isFullscreen={isFullscreen}
                onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-4 gap-3 mb-6">
          <div className="bg-muted/30 rounded-lg p-3 text-center">
            <Wind className="w-4 h-4 mx-auto mb-1 text-primary" />
            <p className="text-xs text-muted-foreground">Wind</p>
            <p className="font-mono text-sm">{weather.current.windSpeed} mph</p>
            <p className="text-xs text-muted-foreground">{weather.current.windDirection}</p>
          </div>
          <div className="bg-muted/30 rounded-lg p-3 text-center">
            <Droplets className="w-4 h-4 mx-auto mb-1 text-blue-400" />
            <p className="text-xs text-muted-foreground">Humidity</p>
            <p className="font-mono text-sm">{weather.current.humidity}%</p>
          </div>
          <div className="bg-muted/30 rounded-lg p-3 text-center">
            <Eye className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Visibility</p>
            <p className="font-mono text-sm">{weather.current.visibility} mi</p>
          </div>
          <div className="bg-muted/30 rounded-lg p-3 text-center">
            <Gauge className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Pressure</p>
            <p className="font-mono text-sm">{weather.current.pressure}"</p>
          </div>
        </div>

        <div className="mb-4">
          <h4 className="font-tech uppercase text-xs text-muted-foreground mb-3">Hourly Forecast</h4>
          <ScrollArea className="w-full">
            <div className="flex gap-3 pb-2">
              {weather.hourly.slice(0, 12).map((hour, i) => (
                <div key={i} className="flex-shrink-0 bg-muted/20 rounded-lg p-2 text-center min-w-[60px]">
                  <p className="text-xs text-muted-foreground">{hour.time}</p>
                  <span className="text-xl my-1 block">{hour.icon}</span>
                  <p className="font-mono text-sm">{hour.temp}°</p>
                  {hour.precipitation > 0 && (
                    <Badge variant="outline" className="text-xs mt-1 text-blue-400 border-blue-400/30">
                      {hour.precipitation}%
                    </Badge>
                  )}
                </div>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>

        <div>
          <h4 className="font-tech uppercase text-xs text-muted-foreground mb-3">7-Day Forecast</h4>
          <div className="space-y-2">
            {weather.daily.slice(0, 5).map((day, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <span className="font-mono text-sm w-12">{day.date}</span>
                <span className="text-xl">{day.icon}</span>
                <span className="text-xs text-muted-foreground flex-1 text-center hidden md:block">{day.description}</span>
                <div className="flex items-center gap-1">
                  {day.precipitation > 20 && (
                    <Badge variant="outline" className="text-xs text-blue-400 border-blue-400/30 mr-2">
                      <Droplets className="w-3 h-3 mr-1" />{day.precipitation}%
                    </Badge>
                  )}
                  <span className="font-mono text-sm">{day.tempHigh}°</span>
                  <span className="text-muted-foreground">/</span>
                  <span className="font-mono text-sm text-muted-foreground">{day.tempLow}°</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
