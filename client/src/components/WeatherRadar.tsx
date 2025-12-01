import React, { useState, useEffect, useRef, useCallback } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Radar, Play, Pause, SkipBack, SkipForward, Layers,
  AlertTriangle, CloudLightning, CloudRain, Wind, Snowflake,
  X, Maximize2, Minimize2, RefreshCw, Zap
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

interface WeatherRadarProps {
  lat: number;
  lon: number;
  onClose?: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

function RadarLayer({ host, frames, currentFrame, opacity }: { 
  host: string; 
  frames: RadarFrame[]; 
  currentFrame: number;
  opacity: number;
}) {
  const map = useMap();
  
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

export default function WeatherRadar({ 
  lat, 
  lon, 
  onClose, 
  isFullscreen = false,
  onToggleFullscreen 
}: WeatherRadarProps) {
  const [radarData, setRadarData] = useState<RadarData | null>(null);
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [radarOpacity, setRadarOpacity] = useState(0.7);
  const [showLayers, setShowLayers] = useState(false);
  const [showAlertDetails, setShowAlertDetails] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPrecipitation, setShowPrecipitation] = useState(true);
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
      const res = await fetch(`/api/weather/alerts?lat=${lat}&lon=${lon}`);
      if (res.ok) {
        const data = await res.json();
        setAlerts(data.alerts || []);
      }
    } catch (err) {
      console.error('Failed to fetch weather alerts:', err);
    }
  }, [lat, lon]);
  
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
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`relative ${isFullscreen ? 'fixed inset-0 z-50' : 'rounded-xl overflow-hidden'}`}
    >
      <Card className={`bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 border-primary/30 overflow-hidden ${isFullscreen ? 'h-full rounded-none' : 'h-[400px] md:h-[500px]'} relative shimmer`}>
        <div className="sparkle-container pointer-events-none">
          <div className="sparkle" style={{ top: '5%', left: '5%' }} />
          <div className="sparkle" style={{ top: '10%', right: '10%', animationDelay: '0.7s' }} />
          <div className="sparkle" style={{ bottom: '15%', left: '15%', animationDelay: '1.4s' }} />
        </div>
        
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
              {onToggleFullscreen && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 hover:bg-primary/20"
                  onClick={onToggleFullscreen}
                  data-testid="button-toggle-fullscreen"
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </Button>
              )}
              {onClose && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 hover:bg-primary/20"
                  onClick={onClose}
                  data-testid="button-close-radar"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
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
                      data-testid={`button-alert-${alert.id}`}
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
          {showAlertDetails && alerts.find(a => a.id === showAlertDetails) && (
            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              className="absolute top-14 right-0 bottom-20 w-80 max-w-[90%] z-[998] p-3"
            >
              <Card className="h-full bg-black/90 backdrop-blur-lg border-primary/30 overflow-hidden">
                {(() => {
                  const alert = alerts.find(a => a.id === showAlertDetails)!;
                  return (
                    <div className="p-4 h-full flex flex-col">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {getSeverityIcon(alert.event)}
                          <Badge className={getSeverityColor(alert.severity)}>
                            {alert.severity}
                          </Badge>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6"
                          onClick={() => setShowAlertDetails(null)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <h3 className="font-tech text-lg text-primary mb-2">{alert.event}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{alert.areaDesc}</p>
                      <ScrollArea className="flex-1">
                        <div className="space-y-3 pr-3">
                          <div>
                            <h4 className="text-xs uppercase text-muted-foreground mb-1">Description</h4>
                            <p className="text-sm">{alert.headline}</p>
                          </div>
                          {alert.instruction && (
                            <div>
                              <h4 className="text-xs uppercase text-muted-foreground mb-1">Instructions</h4>
                              <p className="text-sm text-yellow-400">{alert.instruction}</p>
                            </div>
                          )}
                          <div className="flex gap-4 text-xs text-muted-foreground">
                            <span>Until: {new Date(alert.expires).toLocaleString()}</span>
                          </div>
                        </div>
                      </ScrollArea>
                    </div>
                  );
                })()}
              </Card>
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
                      data-testid="switch-precipitation"
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
                      data-testid="slider-opacity"
                    />
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-white/10">
                  <h5 className="text-xs text-muted-foreground mb-2">Legend</h5>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-2 rounded bg-green-500" />
                      <span>Light Rain</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-2 rounded bg-yellow-500" />
                      <span>Moderate</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-2 rounded bg-orange-500" />
                      <span>Heavy</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-2 rounded bg-red-500" />
                      <span>Intense</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-2 rounded bg-purple-500" />
                      <span>Extreme</span>
                    </div>
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
              center={[lat, lon]}
              zoom={8}
              className="h-full w-full"
              zoomControl={false}
              attributionControl={false}
            >
              <MapController lat={lat} lon={lon} />
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
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-primary/20"
                onClick={() => setCurrentFrame(0)}
                data-testid="button-skip-start"
              >
                <SkipBack className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 hover:bg-primary/20 rounded-full border border-primary/30"
                onClick={() => setIsPlaying(!isPlaying)}
                data-testid="button-play-pause"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-primary/20"
                onClick={() => setCurrentFrame(allFrames.length - 1)}
                data-testid="button-skip-end"
              >
                <SkipForward className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex-1">
              <Slider
                value={[currentFrame]}
                onValueChange={(v) => {
                  setIsPlaying(false);
                  setCurrentFrame(v[0]);
                }}
                max={allFrames.length - 1}
                step={1}
                className="w-full"
                data-testid="slider-timeline"
              />
              <div className="flex justify-between mt-1 text-[10px] text-muted-foreground font-mono">
                <span>{allFrames.length > 0 ? formatTime(allFrames[0].time) : '--:--'}</span>
                <span className="text-primary">{allFrames.length > 0 && currentFrame < allFrames.length ? formatTime(allFrames[currentFrame].time) : '--:--'}</span>
                <span>{allFrames.length > 0 ? formatTime(allFrames[allFrames.length - 1].time) : '--:--'}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
