import React, { useState, useEffect, useRef, useCallback } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Radar, Play, Pause, SkipBack, SkipForward, Layers,
  AlertTriangle, CloudLightning, CloudRain, Wind, Snowflake, Droplets,
  X, RefreshCw, Zap, MapPin, Settings, ThermometerSun, Eye, Gauge
} from "lucide-react";
import "leaflet/dist/leaflet.css";

interface RadarFrame {
  time: number;
  path: string;
}

interface RadarData {
  host: string;
  radar: {
    past: RadarFrame[];
    nowcast: RadarFrame[];
  };
}

interface WeatherAlert {
  id: string;
  event: string;
  severity: 'Minor' | 'Moderate' | 'Severe' | 'Extreme';
  headline: string;
  description: string;
  instruction: string;
  effective: string;
  expires: string;
  areaDesc: string;
}

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

interface WeatherRadarFullProps {
  weather: WeatherData;
  onClose: () => void;
}

function RadarLayer({ host, frames, currentFrame, opacity }: { 
  host: string; 
  frames: RadarFrame[]; 
  currentFrame: number;
  opacity: number;
}) {
  if (!frames.length || currentFrame >= frames.length) return null;
  
  const frame = frames[currentFrame];
  const tileUrl = `${host}${frame.path}/256/{z}/{x}/{y}/2/1_1.png`;
  
  return (
    <TileLayer
      url={tileUrl}
      opacity={opacity}
      className="radar-layer"
    />
  );
}

function MapController({ lat, lon }: { lat: number; lon: number }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView([lat, lon], 8);
  }, [map, lat, lon]);
  
  return null;
}

export default function WeatherRadarFull({ weather, onClose }: WeatherRadarFullProps) {
  const { toast } = useToast();
  const [radarData, setRadarData] = useState<RadarData | null>(null);
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [radarOpacity, setRadarOpacity] = useState(0.7);
  const [showLayers, setShowLayers] = useState(false);
  const [showAlertDetails, setShowAlertDetails] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPrecipitation, setShowPrecipitation] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [zipInput, setZipInput] = useState("");
  const animationRef = useRef<NodeJS.Timeout | null>(null);
  
  const allFrames = radarData ? [...radarData.radar.past, ...radarData.radar.nowcast] : [];
  
  const fetchRadarData = useCallback(async () => {
    try {
      const res = await fetch('https://api.rainviewer.com/public/weather-maps.json');
      const data = await res.json();
      setRadarData(data);
      setCurrentFrame(data.radar.past.length - 1);
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to fetch radar data:', err);
      setIsLoading(false);
    }
  }, []);
  
  const fetchAlerts = useCallback(async () => {
    try {
      const res = await fetch(`/api/weather/alerts?lat=${weather.location.lat}&lon=${weather.location.lon}`);
      if (res.ok) {
        const data = await res.json();
        setAlerts(data.alerts || []);
      }
    } catch (err) {
      console.error('Failed to fetch weather alerts:', err);
    }
  }, [weather.location.lat, weather.location.lon]);
  
  useEffect(() => {
    fetchRadarData();
    fetchAlerts();
    
    const refreshInterval = setInterval(() => {
      fetchRadarData();
      fetchAlerts();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(refreshInterval);
  }, [fetchRadarData, fetchAlerts]);
  
  useEffect(() => {
    if (isPlaying && allFrames.length > 0) {
      animationRef.current = setInterval(() => {
        setCurrentFrame(prev => (prev + 1) % allFrames.length);
      }, 500);
    }
    
    return () => {
      if (animationRef.current) clearInterval(animationRef.current);
    };
  }, [isPlaying, allFrames.length]);
  
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };
  
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Extreme': return 'bg-red-600 text-white border-red-500';
      case 'Severe': return 'bg-orange-600 text-white border-orange-500';
      case 'Moderate': return 'bg-yellow-600 text-black border-yellow-500';
      default: return 'bg-blue-600 text-white border-blue-500';
    }
  };
  
  const getSeverityIcon = (event: string) => {
    const lower = event.toLowerCase();
    if (lower.includes('thunder') || lower.includes('lightning')) return <CloudLightning className="w-4 h-4" />;
    if (lower.includes('rain') || lower.includes('flood')) return <CloudRain className="w-4 h-4" />;
    if (lower.includes('wind') || lower.includes('tornado')) return <Wind className="w-4 h-4" />;
    if (lower.includes('snow') || lower.includes('ice') || lower.includes('winter')) return <Snowflake className="w-4 h-4" />;
    return <AlertTriangle className="w-4 h-4" />;
  };

  const handleSetLocation = () => {
    if (zipInput.length >= 5) {
      localStorage.setItem('weatherZip', zipInput);
      toast({ title: "Location Updated", description: "Refresh to see weather for new location" });
      setSettingsOpen(false);
      onClose();
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-lg"
      data-testid="weather-radar-full"
    >
      <div className="h-full flex flex-col lg:flex-row">
        <div className="flex-1 relative min-h-[50vh] lg:min-h-full">
          <div className="absolute top-0 left-0 right-0 z-[1000] p-3 bg-gradient-to-b from-black/80 via-black/60 to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Radar className="w-5 h-5 text-primary animate-pulse" />
                  <div className="absolute inset-0 bg-primary/30 blur-md animate-pulse" />
                </div>
                <span className="font-tech uppercase text-sm text-primary tracking-wider">Live Radar</span>
                {allFrames.length > 0 && currentFrame < allFrames.length && (
                  <Badge variant="outline" className="border-primary/40 text-primary text-xs font-mono">
                    {formatTime(allFrames[currentFrame].time)}
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 hover:bg-primary/20"
                  onClick={() => setShowLayers(!showLayers)}
                  data-testid="button-radar-layers"
                >
                  <Layers className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 hover:bg-primary/20"
                  onClick={() => { fetchRadarData(); fetchAlerts(); }}
                  data-testid="button-refresh-radar"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 hover:bg-red-500/20 hover:text-red-400"
                  onClick={onClose}
                  data-testid="button-close-weather-full"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
          
          <AnimatePresence>
            {alerts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute top-14 left-0 right-0 z-[999] px-3"
              >
                <ScrollArea className="w-full">
                  <div className="flex gap-2 pb-2">
                    {alerts.map((alert) => (
                      <motion.button
                        key={alert.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowAlertDetails(showAlertDetails === alert.id ? null : alert.id)}
                        className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg border ${getSeverityColor(alert.severity)} transition-all shadow-lg hover:shadow-xl`}
                      >
                        {getSeverityIcon(alert.event)}
                        <span className="text-xs font-medium whitespace-nowrap">{alert.event}</span>
                        <Zap className="w-3 h-3 animate-pulse" />
                      </motion.button>
                    ))}
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </motion.div>
            )}
          </AnimatePresence>
          
          <AnimatePresence>
            {showLayers && (
              <motion.div
                initial={{ opacity: 0, x: -200 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -200 }}
                className="absolute top-14 left-0 bottom-20 w-56 z-[998] p-3"
              >
                <Card className="h-fit bg-black/90 backdrop-blur-lg border-primary/30 p-4">
                  <h4 className="font-tech uppercase text-xs text-primary mb-4">Radar Layers</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CloudRain className="w-4 h-4 text-blue-400" />
                        <span className="text-sm">Precipitation</span>
                      </div>
                      <Switch 
                        checked={showPrecipitation} 
                        onCheckedChange={setShowPrecipitation}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-2 block">Opacity</label>
                      <Slider
                        value={[radarOpacity * 100]}
                        onValueChange={(v) => setRadarOpacity(v[0] / 100)}
                        max={100}
                        step={5}
                        className="w-full"
                      />
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <h5 className="text-xs text-muted-foreground mb-2">Legend</h5>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2"><div className="w-4 h-2 rounded bg-green-500" /><span>Light</span></div>
                      <div className="flex items-center gap-2"><div className="w-4 h-2 rounded bg-yellow-500" /><span>Moderate</span></div>
                      <div className="flex items-center gap-2"><div className="w-4 h-2 rounded bg-orange-500" /><span>Heavy</span></div>
                      <div className="flex items-center gap-2"><div className="w-4 h-2 rounded bg-red-500" /><span>Intense</span></div>
                      <div className="flex items-center gap-2"><div className="w-4 h-2 rounded bg-purple-500" /><span>Extreme</span></div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
          
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
              <div className="text-center">
                <div className="relative">
                  <Radar className="w-16 h-16 text-primary animate-pulse mx-auto mb-4" />
                  <div className="absolute inset-0 bg-primary/20 blur-xl animate-pulse" />
                </div>
                <p className="text-sm text-muted-foreground">Loading radar data...</p>
              </div>
            </div>
          ) : (
            <div className="absolute inset-0">
              <MapContainer
                center={[weather.location.lat, weather.location.lon]}
                zoom={8}
                className="h-full w-full"
                zoomControl={false}
                attributionControl={false}
              >
                <MapController lat={weather.location.lat} lon={weather.location.lon} />
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  className="base-map"
                />
                {showPrecipitation && radarData && allFrames.length > 0 && (
                  <RadarLayer
                    host={radarData.host}
                    frames={allFrames}
                    currentFrame={currentFrame}
                    opacity={radarOpacity}
                  />
                )}
              </MapContainer>
            </div>
          )}
          
          <div className="absolute bottom-0 left-0 right-0 z-[1000] p-3 bg-gradient-to-t from-black/90 via-black/70 to-transparent">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/20" onClick={() => setCurrentFrame(0)}>
                  <SkipBack className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-primary/20 rounded-full border border-primary/30" onClick={() => setIsPlaying(!isPlaying)}>
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/20" onClick={() => setCurrentFrame(allFrames.length - 1)}>
                  <SkipForward className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex-1">
                <Slider
                  value={[currentFrame]}
                  onValueChange={(v) => { setIsPlaying(false); setCurrentFrame(v[0]); }}
                  max={allFrames.length - 1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between mt-1 text-[10px] text-muted-foreground font-mono">
                  <span>{allFrames.length > 0 ? formatTime(allFrames[0].time) : '--:--'}</span>
                  <span className="text-primary">{allFrames.length > 0 && currentFrame < allFrames.length ? formatTime(allFrames[currentFrame].time) : '--:--'}</span>
                  <span>{allFrames.length > 0 ? formatTime(allFrames[allFrames.length - 1].time) : '--:--'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="w-full lg:w-96 bg-gradient-to-b lg:bg-gradient-to-l from-slate-900/95 to-black/95 border-t lg:border-t-0 lg:border-l border-primary/20 overflow-y-auto max-h-[50vh] lg:max-h-full">
          <div className="p-4 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                <div>
                  <h3 className="font-tech uppercase text-base">
                    {weather.location.city}{weather.location.state ? `, ${weather.location.state}` : ''}
                  </h3>
                  <p className="text-xs text-muted-foreground">{weather.current.description}</p>
                </div>
              </div>
              <Popover open={settingsOpen} onOpenChange={setSettingsOpen}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
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
                      />
                      <Button onClick={handleSetLocation} disabled={zipInput.length < 5}>
                        Save
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
              <span className="text-4xl">{weather.current.icon}</span>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-tech font-bold">{weather.current.temp}</span>
                  <span className="text-xl text-muted-foreground">°F</span>
                </div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <ThermometerSun className="w-4 h-4" />
                  Feels like {weather.current.feelsLike}°
                </p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <div className="bg-white/5 rounded-lg p-2 text-center">
                <Wind className="w-4 h-4 mx-auto mb-1 text-primary" />
                <p className="text-[10px] text-muted-foreground">Wind</p>
                <p className="font-mono text-xs">{weather.current.windSpeed} mph</p>
              </div>
              <div className="bg-white/5 rounded-lg p-2 text-center">
                <Droplets className="w-4 h-4 mx-auto mb-1 text-blue-400" />
                <p className="text-[10px] text-muted-foreground">Humidity</p>
                <p className="font-mono text-xs">{weather.current.humidity}%</p>
              </div>
              <div className="bg-white/5 rounded-lg p-2 text-center">
                <Eye className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                <p className="text-[10px] text-muted-foreground">Visibility</p>
                <p className="font-mono text-xs">{weather.current.visibility} mi</p>
              </div>
              <div className="bg-white/5 rounded-lg p-2 text-center">
                <Gauge className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                <p className="text-[10px] text-muted-foreground">Pressure</p>
                <p className="font-mono text-xs">{weather.current.pressure}"</p>
              </div>
            </div>

            <div>
              <h4 className="font-tech uppercase text-xs text-muted-foreground mb-2">Hourly</h4>
              <ScrollArea className="w-full">
                <div className="flex gap-2 pb-2">
                  {weather.hourly.slice(0, 12).map((hour, i) => (
                    <div key={i} className="flex-shrink-0 bg-white/5 rounded-lg p-2 text-center min-w-[50px]">
                      <p className="text-[10px] text-muted-foreground">{hour.time}</p>
                      <span className="text-lg block">{hour.icon}</span>
                      <p className="font-mono text-xs">{hour.temp}°</p>
                      {hour.precipitation > 0 && (
                        <Badge variant="outline" className="text-[8px] mt-1 text-blue-400 border-blue-400/30 px-1">
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
              <h4 className="font-tech uppercase text-xs text-muted-foreground mb-2">7-Day Forecast</h4>
              <div className="space-y-1">
                {weather.daily.slice(0, 7).map((day, i) => (
                  <div key={i} className="flex items-center justify-between py-2 px-2 bg-white/5 rounded-lg">
                    <span className="font-mono text-xs w-10">{day.date}</span>
                    <span className="text-lg">{day.icon}</span>
                    <span className="text-[10px] text-muted-foreground flex-1 text-center hidden sm:block">{day.description}</span>
                    <div className="flex items-center gap-1">
                      {day.precipitation > 20 && (
                        <Badge variant="outline" className="text-[8px] text-blue-400 border-blue-400/30 mr-1 px-1">
                          <Droplets className="w-2 h-2 mr-0.5" />{day.precipitation}%
                        </Badge>
                      )}
                      <span className="font-mono text-xs">{day.tempHigh}°</span>
                      <span className="text-muted-foreground text-xs">/</span>
                      <span className="font-mono text-xs text-muted-foreground">{day.tempLow}°</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}