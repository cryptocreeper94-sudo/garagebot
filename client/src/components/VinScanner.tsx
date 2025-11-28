import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Camera, X, ScanLine, Type, CheckCircle2, AlertTriangle, 
  Car, Loader2, ClipboardPaste, Trash2, Save, Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface VinDecodeResult {
  vin: string;
  year: number;
  make: string;
  model: string;
  trim?: string;
  bodyStyle?: string;
  engineType?: string;
  engineSize?: string;
  fuelType?: string;
  transmission?: string;
  drivetrain?: string;
  vehicleType?: string;
  manufacturer?: string;
  plantCountry?: string;
  errorCode?: string;
  errorText?: string;
}

interface VinScannerProps {
  onVehicleDecoded?: (result: VinDecodeResult) => void;
  onAddToGarage?: (result: VinDecodeResult) => void;
  showAddToGarage?: boolean;
}

export default function VinScanner({ onVehicleDecoded, onAddToGarage, showAddToGarage = true }: VinScannerProps) {
  const [activeTab, setActiveTab] = useState<"camera" | "manual">("manual");
  const [vinInput, setVinInput] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [decodedResult, setDecodedResult] = useState<VinDecodeResult | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const decodeMutation = useMutation({
    mutationFn: async (vin: string) => {
      const res = await fetch(`/api/vin/decode/${vin}`);
      if (!res.ok) throw new Error('Failed to decode VIN');
      const data = await res.json();
      return {
        vin: data.vin,
        year: parseInt(data.year) || 0,
        make: data.make,
        model: data.model,
        trim: data.trim,
        bodyStyle: data.bodyClass,
        engineType: data.engineCylinders ? `${data.engineCylinders}-Cylinder` : undefined,
        engineSize: data.engineDisplacement ? `${data.engineDisplacement}L` : undefined,
        fuelType: data.fuelType,
        transmission: data.transmission,
        drivetrain: data.driveType,
        vehicleType: data.vehicleType,
        manufacturer: data.manufacturerName,
        plantCountry: data.plantCountry,
        errorCode: data.errorCode,
        errorText: data.errorText,
      };
    },
    onSuccess: (data: VinDecodeResult) => {
      setDecodedResult(data);
      setScanError(null);
      if (data.errorCode && data.errorCode !== "0") {
        setScanError(data.errorText || "Invalid VIN");
      } else {
        onVehicleDecoded?.(data);
        toast({
          title: "VIN Decoded",
          description: `${data.year} ${data.make} ${data.model}`,
        });
      }
    },
    onError: (error) => {
      setScanError("Failed to decode VIN. Please check the number and try again.");
      toast({
        title: "Decode Error",
        description: "Failed to decode VIN",
        variant: "destructive",
      });
    },
  });

  const addToGarageMutation = useMutation({
    mutationFn: async (vehicle: VinDecodeResult) => {
      const res = await fetch('/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          vin: vehicle.vin,
          year: vehicle.year,
          make: vehicle.make,
          model: vehicle.model,
          trim: vehicle.trim,
          bodyStyle: vehicle.bodyStyle,
          engineType: vehicle.engineType,
          engineSize: vehicle.engineSize,
          fuelType: vehicle.fuelType,
          transmission: vehicle.transmission,
          drivetrain: vehicle.drivetrain,
          vehicleType: vehicle.vehicleType || 'car',
        }),
      });
      if (!res.ok) throw new Error('Failed to add vehicle');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      toast({
        title: "Vehicle Added",
        description: "Vehicle added to your garage",
      });
      onAddToGarage?.(decodedResult!);
      setDecodedResult(null);
      setVinInput("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add vehicle to garage",
        variant: "destructive",
      });
    },
  });

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: 1280, height: 720 }
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsScanning(true);
    } catch (error) {
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please use manual entry.",
        variant: "destructive",
      });
      setActiveTab("manual");
    }
  };

  const stopCamera = useCallback(() => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsScanning(false);
  }, [cameraStream]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const validateVin = (vin: string): boolean => {
    const cleanVin = vin.replace(/[^A-HJ-NPR-Z0-9]/gi, '').toUpperCase();
    return cleanVin.length === 17;
  };

  const handleManualSubmit = () => {
    const cleanVin = vinInput.replace(/[^A-HJ-NPR-Z0-9]/gi, '').toUpperCase();
    if (!validateVin(cleanVin)) {
      setScanError("VIN must be exactly 17 characters (letters and numbers, excluding I, O, Q)");
      return;
    }
    setScanError(null);
    decodeMutation.mutate(cleanVin);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const cleanVin = text.replace(/[^A-HJ-NPR-Z0-9]/gi, '').toUpperCase();
      setVinInput(cleanVin);
    } catch (error) {
      toast({
        title: "Paste Error",
        description: "Unable to read clipboard",
        variant: "destructive",
      });
    }
  };

  const clearResult = () => {
    setDecodedResult(null);
    setVinInput("");
    setScanError(null);
  };

  return (
    <Card className="bg-card border-primary/30 overflow-hidden">
      <div className="p-4 border-b border-border/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
            <ScanLine className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-tech text-lg uppercase text-primary">VIN Scanner</h3>
            <p className="text-xs text-muted-foreground">Scan or enter your 17-digit VIN</p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "camera" | "manual")} className="w-full">
        <TabsList className="w-full rounded-none border-b border-border/40 bg-transparent h-auto p-0">
          <TabsTrigger 
            value="manual" 
            className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3"
            onClick={stopCamera}
          >
            <Type className="w-4 h-4 mr-2" /> Manual Entry
          </TabsTrigger>
          <TabsTrigger 
            value="camera" 
            className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3"
          >
            <Camera className="w-4 h-4 mr-2" /> Camera Scan
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manual" className="p-4 mt-0">
          <div className="space-y-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="Enter 17-digit VIN"
                value={vinInput}
                onChange={(e) => setVinInput(e.target.value.toUpperCase().slice(0, 17))}
                className="text-lg tracking-widest font-mono uppercase pr-20"
                maxLength={17}
                data-testid="input-vin"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={handlePaste}
                >
                  <ClipboardPaste className="w-4 h-4" />
                </Button>
                {vinInput && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => setVinInput("")}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{vinInput.length}/17 characters</span>
              {vinInput.length === 17 && (
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Valid Length
                </Badge>
              )}
            </div>

            <Button 
              onClick={handleManualSubmit} 
              className="w-full font-tech uppercase"
              disabled={vinInput.length !== 17 || decodeMutation.isPending}
              data-testid="button-decode-vin"
            >
              {decodeMutation.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Decoding...</>
              ) : (
                <><ScanLine className="w-4 h-4 mr-2" /> Decode VIN</>
              )}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="camera" className="p-4 mt-0">
          <div className="space-y-4">
            {!isScanning ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                  <Camera className="w-8 h-8 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Point your camera at the VIN barcode or text on your vehicle
                </p>
                <Button onClick={startCamera} className="font-tech uppercase">
                  <Camera className="w-4 h-4 mr-2" /> Start Camera
                </Button>
              </div>
            ) : (
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full rounded-lg"
                />
                <canvas ref={canvasRef} className="hidden" />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-4/5 h-16 border-2 border-primary/50 rounded-lg flex items-center justify-center">
                    <motion.div
                      className="w-full h-0.5 bg-primary/50"
                      animate={{ y: [-20, 20, -20] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />
                  </div>
                </div>
                <Button
                  onClick={stopCamera}
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                >
                  <X className="w-4 h-4" />
                </Button>
                <p className="text-center text-xs text-muted-foreground mt-2">
                  Camera scanning is experimental. Use manual entry for best results.
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <AnimatePresence>
        {scanError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 pb-4"
          >
            <div className="flex items-start gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">{scanError}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {decodedResult && !decodedResult.errorCode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-border/40"
          >
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center justify-center">
                    <Car className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">
                      {decodedResult.year} {decodedResult.make}
                    </h4>
                    <p className="text-muted-foreground">
                      {decodedResult.model} {decodedResult.trim}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={clearResult}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                {decodedResult.bodyStyle && (
                  <div>
                    <p className="text-muted-foreground text-xs">Body Style</p>
                    <p className="font-medium">{decodedResult.bodyStyle}</p>
                  </div>
                )}
                {decodedResult.engineType && (
                  <div>
                    <p className="text-muted-foreground text-xs">Engine</p>
                    <p className="font-medium">{decodedResult.engineType}</p>
                  </div>
                )}
                {decodedResult.engineSize && (
                  <div>
                    <p className="text-muted-foreground text-xs">Displacement</p>
                    <p className="font-medium">{decodedResult.engineSize}</p>
                  </div>
                )}
                {decodedResult.fuelType && (
                  <div>
                    <p className="text-muted-foreground text-xs">Fuel Type</p>
                    <p className="font-medium">{decodedResult.fuelType}</p>
                  </div>
                )}
                {decodedResult.transmission && (
                  <div>
                    <p className="text-muted-foreground text-xs">Transmission</p>
                    <p className="font-medium">{decodedResult.transmission}</p>
                  </div>
                )}
                {decodedResult.drivetrain && (
                  <div>
                    <p className="text-muted-foreground text-xs">Drivetrain</p>
                    <p className="font-medium">{decodedResult.drivetrain}</p>
                  </div>
                )}
                {decodedResult.manufacturer && (
                  <div>
                    <p className="text-muted-foreground text-xs">Manufacturer</p>
                    <p className="font-medium">{decodedResult.manufacturer}</p>
                  </div>
                )}
                {decodedResult.plantCountry && (
                  <div>
                    <p className="text-muted-foreground text-xs">Country</p>
                    <p className="font-medium">{decodedResult.plantCountry}</p>
                  </div>
                )}
              </div>

              <div className="p-2 bg-white/5 rounded text-center font-mono text-sm tracking-widest">
                {decodedResult.vin}
              </div>

              {showAddToGarage && user && (
                <Button 
                  onClick={() => addToGarageMutation.mutate(decodedResult)} 
                  className="w-full font-tech uppercase bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500"
                  disabled={addToGarageMutation.isPending}
                  data-testid="button-add-to-garage"
                >
                  {addToGarageMutation.isPending ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Adding...</>
                  ) : (
                    <><Plus className="w-4 h-4 mr-2" /> Add to My Garage</>
                  )}
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
