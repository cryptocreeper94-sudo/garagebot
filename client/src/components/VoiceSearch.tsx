import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mic, MicOff, X, Loader2, Volume2, Sparkles, Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

interface VoiceSearchProps {
  onSearch?: (query: string) => void;
  vehicleContext?: { year: number; make: string; model: string };
  triggerPhrase?: string;
}

export default function VoiceSearch({ 
  onSearch, 
  vehicleContext,
  triggerPhrase = "hey buddy"
}: VoiceSearchProps) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [finalTranscript, setFinalTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAlwaysListening, setIsAlwaysListening] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();
  const [, navigate] = useLocation();

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalText = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalText += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      if (finalText) {
        setFinalTranscript(prev => prev + ' ' + finalText);
        
        // Check for trigger phrase in always-listening mode
        if (isAlwaysListening) {
          const lowerText = finalText.toLowerCase();
          if (lowerText.includes(triggerPhrase)) {
            const afterTrigger = lowerText.split(triggerPhrase).pop()?.trim();
            if (afterTrigger) {
              handleVoiceCommand(afterTrigger);
            }
          }
        }
      }
      
      setTranscript(interimTranscript || finalText);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        setError("Microphone access denied. Please enable microphone permissions.");
      } else if (event.error === 'no-speech') {
        // Ignore no-speech errors in always-listening mode
        if (!isAlwaysListening) {
          setError("No speech detected. Please try again.");
        }
      } else {
        setError(`Voice recognition error: ${event.error}`);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      // Restart if in always-listening mode
      if (isAlwaysListening) {
        try {
          recognition.start();
        } catch (e) {
          // Ignore if already started
        }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, [isAlwaysListening, triggerPhrase]);

  const handleVoiceCommand = useCallback((command: string) => {
    setIsProcessing(true);
    
    // Parse voice commands
    const lowerCommand = command.toLowerCase().trim();
    
    // Common search patterns
    let searchQuery = '';
    
    if (lowerCommand.includes('find') || lowerCommand.includes('search for') || lowerCommand.includes('look for')) {
      searchQuery = lowerCommand
        .replace(/find\s+me\s+/i, '')
        .replace(/find\s+/i, '')
        .replace(/search\s+for\s+/i, '')
        .replace(/look\s+for\s+/i, '')
        .trim();
    } else if (lowerCommand.includes('i need')) {
      searchQuery = lowerCommand.replace(/i\s+need\s+/i, '').trim();
    } else if (lowerCommand.includes('looking for')) {
      searchQuery = lowerCommand.replace(/.*looking\s+for\s+/i, '').trim();
    } else {
      // Just use the command as a search query
      searchQuery = lowerCommand;
    }

    // Add vehicle context if available
    if (vehicleContext && !lowerCommand.includes(vehicleContext.make.toLowerCase())) {
      searchQuery = `${vehicleContext.year} ${vehicleContext.make} ${vehicleContext.model} ${searchQuery}`;
    }

    setTimeout(() => {
      setIsProcessing(false);
      if (onSearch) {
        onSearch(searchQuery);
      } else {
        navigate(`/results?q=${encodeURIComponent(searchQuery)}`);
      }
      toast({
        title: "Searching...",
        description: `Looking for: ${searchQuery}`,
      });
    }, 500);
  }, [vehicleContext, onSearch, navigate, toast]);

  const startListening = () => {
    if (!recognitionRef.current) return;
    
    setTranscript("");
    setFinalTranscript("");
    setError(null);
    
    try {
      recognitionRef.current.start();
    } catch (e) {
      console.error('Failed to start recognition:', e);
    }
  };

  const stopListening = () => {
    if (!recognitionRef.current) return;
    recognitionRef.current.stop();
    setIsListening(false);
    
    if (finalTranscript.trim()) {
      handleVoiceCommand(finalTranscript.trim());
    }
  };

  const cancelListening = () => {
    if (!recognitionRef.current) return;
    recognitionRef.current.stop();
    setIsListening(false);
    setTranscript("");
    setFinalTranscript("");
  };

  if (!isSupported) {
    return (
      <Card className="bg-card border-primary/30 p-4">
        <div className="flex items-center gap-3 text-muted-foreground">
          <MicOff className="w-5 h-5" />
          <span className="text-sm">Voice search is not supported in this browser</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-primary/30 overflow-hidden">
      <div className="p-4 border-b border-border/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
              isListening 
                ? 'bg-red-500/20 border border-red-500/50' 
                : 'bg-primary/10 border border-primary/30'
            }`}>
              {isListening ? (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Mic className="w-5 h-5 text-red-400" />
                </motion.div>
              ) : (
                <Mic className="w-5 h-5 text-primary" />
              )}
            </div>
            <div>
              <h3 className="font-tech text-lg uppercase text-primary">Voice Search</h3>
              <p className="text-xs text-muted-foreground">
                {isListening ? 'Listening...' : `Say "${triggerPhrase}" or tap to search`}
              </p>
            </div>
          </div>
          {isListening && (
            <Badge className="bg-red-500/20 text-red-400 border-red-500/30 animate-pulse">
              <Volume2 className="w-3 h-3 mr-1" /> LIVE
            </Badge>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4">
        <AnimatePresence mode="wait">
          {!isListening && !isProcessing && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-4"
            >
              <Button
                onClick={startListening}
                size="lg"
                className="h-20 w-20 rounded-full bg-gradient-to-br from-primary to-cyan-600 hover:from-primary/90 hover:to-cyan-600/90 shadow-lg shadow-primary/25"
                data-testid="button-voice-search"
              >
                <Mic className="w-8 h-8" />
              </Button>
              <p className="text-sm text-muted-foreground mt-4">
                Tap to start voice search
              </p>
              
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <Badge variant="outline" className="text-xs">
                  "Find brake pads"
                </Badge>
                <Badge variant="outline" className="text-xs">
                  "I need an oil filter"
                </Badge>
                <Badge variant="outline" className="text-xs">
                  "Search for spark plugs"
                </Badge>
              </div>
            </motion.div>
          )}

          {isListening && (
            <motion.div
              key="listening"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center py-4"
            >
              <div className="relative inline-block">
                <motion.div
                  className="absolute inset-0 rounded-full bg-red-500/20"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <motion.div
                  className="absolute inset-0 rounded-full bg-red-500/20"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                />
                <Button
                  size="lg"
                  className="h-20 w-20 rounded-full bg-red-500 hover:bg-red-600 relative z-10"
                  onClick={stopListening}
                >
                  <MicOff className="w-8 h-8" />
                </Button>
              </div>

              <div className="mt-6 min-h-[60px]">
                <p className="text-lg font-medium">
                  {transcript || finalTranscript || "Listening..."}
                </p>
                {transcript && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Keep speaking or tap the mic to search
                  </p>
                )}
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={cancelListening}
                className="mt-4"
              >
                <X className="w-4 h-4 mr-2" /> Cancel
              </Button>
            </motion.div>
          )}

          {isProcessing && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8"
            >
              <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
              <p className="mt-4 text-muted-foreground">Processing your request...</p>
              {finalTranscript && (
                <p className="mt-2 text-sm font-medium">"{finalTranscript.trim()}"</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">
            {error}
          </div>
        )}

        {vehicleContext && !isListening && (
          <div className="flex items-center gap-2 p-2 bg-blue-500/10 border border-blue-500/30 rounded-lg text-xs text-blue-300">
            <Sparkles className="w-4 h-4" />
            <span>Voice search will auto-add: {vehicleContext.year} {vehicleContext.make} {vehicleContext.model}</span>
          </div>
        )}
      </div>
    </Card>
  );
}
