import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { 
  Camera, Upload, X, Loader2, Search, Image, Sparkles,
  Car, CheckCircle2, AlertTriangle, ZoomIn
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

interface PartIdentification {
  partName: string;
  partNumber?: string;
  description: string;
  category: string;
  confidence: number;
  alternateNames?: string[];
  compatibleVehicles?: string[];
  estimatedPrice?: string;
  searchQuery: string;
}

interface PhotoSearchProps {
  onPartIdentified?: (part: PartIdentification) => void;
  vehicleContext?: { year: number; make: string; model: string };
}

export default function PhotoSearch({ onPartIdentified, vehicleContext }: PhotoSearchProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [identifiedPart, setIdentifiedPart] = useState<PartIdentification | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const identifyMutation = useMutation({
    mutationFn: async (imageData: string) => {
      const res = await fetch('/api/ai/identify-part', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          image: imageData,
          vehicleContext 
        }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to identify part');
      }
      return res.json();
    },
    onSuccess: (data: PartIdentification) => {
      setIdentifiedPart(data);
      onPartIdentified?.(data);
      toast({
        title: "Part Identified",
        description: `Found: ${data.partName}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Identification Failed",
        description: error.message || "Could not identify the part. Try a clearer photo.",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File",
          description: "Please select an image file",
          variant: "destructive",
        });
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: 1280, height: 720 }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCapturing(true);
    } catch (error) {
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please upload an image instead.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCapturing(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      setSelectedImage(dataUrl);
      stopCamera();
    }
  };

  const analyzeImage = () => {
    if (!selectedImage) return;
    identifyMutation.mutate(selectedImage);
  };

  const clearImage = () => {
    setSelectedImage(null);
    setImageFile(null);
    setIdentifiedPart(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const searchForPart = () => {
    if (!identifiedPart) return;
    
    let query = identifiedPart.searchQuery || identifiedPart.partName;
    if (vehicleContext) {
      query = `${vehicleContext.year} ${vehicleContext.make} ${vehicleContext.model} ${query}`;
    }
    
    navigate(`/results?q=${encodeURIComponent(query)}`);
  };

  return (
    <Card className="bg-card border-primary/30 overflow-hidden">
      <div className="p-4 border-b border-border/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="font-tech text-lg uppercase text-primary">Photo Search</h3>
            <p className="text-xs text-muted-foreground">Snap a photo, AI identifies the part</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileSelect}
          className="hidden"
        />
        <canvas ref={canvasRef} className="hidden" />

        <AnimatePresence mode="wait">
          {!selectedImage && !isCapturing && (
            <motion.div
              key="options"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              <Button
                onClick={startCamera}
                variant="outline"
                className="w-full h-24 flex flex-col gap-2 border-dashed border-2 hover:bg-primary/5 hover:border-primary/50"
                data-testid="button-camera-capture"
              >
                <Camera className="w-8 h-8 text-primary" />
                <span className="font-tech uppercase text-sm">Take Photo</span>
              </Button>
              
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="w-full h-24 flex flex-col gap-2 border-dashed border-2 hover:bg-primary/5 hover:border-primary/50"
                data-testid="button-upload-photo"
              >
                <Upload className="w-8 h-8 text-primary" />
                <span className="font-tech uppercase text-sm">Upload Image</span>
              </Button>

              {vehicleContext && (
                <div className="flex items-center gap-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg text-sm">
                  <Car className="w-4 h-4 text-blue-400" />
                  <span className="text-blue-300">
                    Context: {vehicleContext.year} {vehicleContext.make} {vehicleContext.model}
                  </span>
                </div>
              )}
            </motion.div>
          )}

          {isCapturing && (
            <motion.div
              key="camera"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative"
            >
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full rounded-lg"
              />
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                <Button
                  onClick={stopCamera}
                  variant="outline"
                  className="bg-background/80 backdrop-blur"
                >
                  <X className="w-4 h-4 mr-2" /> Cancel
                </Button>
                <Button
                  onClick={capturePhoto}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Camera className="w-4 h-4 mr-2" /> Capture
                </Button>
              </div>
            </motion.div>
          )}

          {selectedImage && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-4"
            >
              <div className="relative group">
                <img
                  src={selectedImage}
                  alt="Selected part"
                  className="w-full rounded-lg object-contain max-h-64"
                />
                <button
                  onClick={clearImage}
                  className="absolute top-2 right-2 p-2 rounded-full bg-background/80 backdrop-blur hover:bg-red-500/20 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-2 right-2">
                  <Badge className="bg-background/80 backdrop-blur text-xs">
                    <Image className="w-3 h-3 mr-1" /> Ready to analyze
                  </Badge>
                </div>
              </div>

              {!identifiedPart && (
                <Button
                  onClick={analyzeImage}
                  disabled={identifyMutation.isPending}
                  className="w-full font-tech uppercase bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
                  data-testid="button-analyze-image"
                >
                  {identifyMutation.isPending ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing...</>
                  ) : (
                    <><Sparkles className="w-4 h-4 mr-2" /> Identify Part</>
                  )}
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {identifiedPart && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="border-t border-border/40 pt-4 space-y-4"
            >
              <div className="flex items-center gap-2 text-green-400 mb-2">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-tech uppercase text-sm">Part Identified</span>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30 ml-auto">
                  {Math.round(identifiedPart.confidence * 100)}% Match
                </Badge>
              </div>

              <div className="bg-white/5 rounded-lg p-4 space-y-3">
                <div>
                  <h4 className="font-bold text-lg">{identifiedPart.partName}</h4>
                  {identifiedPart.partNumber && (
                    <p className="text-sm font-mono text-muted-foreground">
                      Part #: {identifiedPart.partNumber}
                    </p>
                  )}
                </div>
                
                <p className="text-sm text-muted-foreground">{identifiedPart.description}</p>
                
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {identifiedPart.category}
                  </Badge>
                  {identifiedPart.estimatedPrice && (
                    <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">
                      Est. ${identifiedPart.estimatedPrice}
                    </Badge>
                  )}
                </div>

                {identifiedPart.alternateNames && identifiedPart.alternateNames.length > 0 && (
                  <div className="text-xs text-muted-foreground">
                    <span className="text-foreground">Also known as:</span> {identifiedPart.alternateNames.join(", ")}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={searchForPart}
                  className="flex-1 font-tech uppercase"
                  data-testid="button-search-part"
                >
                  <Search className="w-4 h-4 mr-2" /> Find This Part
                </Button>
                <Button
                  onClick={clearImage}
                  variant="outline"
                  className="font-tech"
                >
                  New Photo
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
}
