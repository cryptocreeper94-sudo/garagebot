import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { 
  MessageCircle, X, Send, Loader2, Sparkles, 
  Lightbulb, ChevronDown, Camera, Search,
  ExternalLink, Car, AlertCircle, CheckCircle2
} from "lucide-react";

import mascotWaving from "@assets/mascot_transparent/robot_mascot_waving_hello.png";
import mascotThinking from "@assets/mascot_transparent/robot_mascot_thinking_pose.png";

interface VehicleInfo {
  type?: string;
  year?: string;
  make?: string;
  model?: string;
  engine?: string;
}

interface PartInfo {
  name?: string;
  partNumber?: string;
  description?: string;
  condition?: string;
}

interface SearchParams {
  query: string;
  year?: string;
  make?: string;
  model?: string;
  category?: string;
}

interface ImageIdentification {
  success: boolean;
  vehicleInfo?: VehicleInfo;
  partInfo?: PartInfo;
  confidence: number;
  suggestions: string[];
}

interface Message {
  role: "user" | "assistant";
  content: string;
  searchParams?: SearchParams;
  imageIdentification?: ImageIdentification;
  isImageUpload?: boolean;
}

interface AIMascotProps {
  mascotName?: string;
}

// Store search context across sessions
const searchContext = {
  lastVehicle: null as VehicleInfo | null,
  lastPart: null as PartInfo | null,
  lastQuery: ''
};

export default function AIMascot({ mascotName = "Buddy" }: AIMascotProps) {
  const [, navigate] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [rateLimitError, setRateLimitError] = useState<{ message: string; retryAfter: number } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsExiting(false);
    }, 400);
  };

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      fetchGreeting();
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Clear rate limit error after timeout
  useEffect(() => {
    if (rateLimitError) {
      const timer = setTimeout(() => {
        setRateLimitError(null);
      }, rateLimitError.retryAfter * 1000);
      return () => clearTimeout(timer);
    }
  }, [rateLimitError]);

  const fetchGreeting = async () => {
    try {
      const res = await fetch("/api/ai/greeting");
      if (!res.ok) throw new Error('Failed to fetch greeting');
      const data = await res.json();
      setMessages([{ role: "assistant", content: data.greeting }]);
    } catch {
      setMessages([{ role: "assistant", content: `Hey there! I'm ${mascotName}, your parts-finding buddy. Tell me what you need or upload a photo!` }]);
    }
  };

  const buildSearchUrl = (params: SearchParams): string => {
    const urlParams = new URLSearchParams();
    
    // Build a proper search query
    let query = params.query || '';
    
    // Add vehicle info to query if available
    if (params.year) urlParams.set('year', params.year);
    if (params.make) urlParams.set('make', params.make);
    if (params.model) urlParams.set('model', params.model);
    
    // Map vehicle types to categories the Results page understands
    if (params.category) {
      const categoryMap: Record<string, string> = {
        'car': 'automobile',
        'truck': 'automobile',
        'suv': 'automobile',
        'motorcycle': 'motorcycle',
        'atv': 'powersports',
        'utv': 'powersports',
        'boat': 'marine',
        'pwc': 'marine',
        'rv': 'rv',
        'small_engine': 'small-engine',
        'diesel': 'diesel',
      };
      const mappedCategory = categoryMap[params.category.toLowerCase()] || params.category;
      urlParams.set('category', mappedCategory);
    }
    
    urlParams.set('q', query);
    
    return `/results?${urlParams.toString()}`;
  };

  const handleApiError = (res: Response, data: any): boolean => {
    if (res.status === 429) {
      setRateLimitError({
        message: data.error || 'Too many requests',
        retryAfter: data.retryAfter || 60
      });
      return true;
    }
    return false;
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading || rateLimitError) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      // Include context from previous identifications
      const contextualQuery = searchContext.lastVehicle 
        ? `${userMessage} (vehicle context: ${searchContext.lastVehicle.year || ''} ${searchContext.lastVehicle.make || ''} ${searchContext.lastVehicle.model || ''})`
        : userMessage;

      const [parseRes, chatRes] = await Promise.all([
        fetch("/api/ai/parse-search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: contextualQuery })
        }),
        fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [...messages, { role: "user", content: userMessage }]
          })
        })
      ]);

      const parseData = await parseRes.json();
      const chatData = await chatRes.json();
      
      if (handleApiError(parseRes, parseData) || handleApiError(chatRes, chatData)) {
        setMessages(prev => [...prev, { 
          role: "assistant", 
          content: "I need a short break - too many requests! Please wait a moment."
        }]);
        return;
      }
      
      // Determine if we have searchable content
      const hasSearchableContent = parseData.partType || (parseData.year && parseData.make);
      
      let searchParams: SearchParams | undefined;
      if (hasSearchableContent) {
        // Merge with stored context
        const mergedYear = parseData.year || searchContext.lastVehicle?.year;
        const mergedMake = parseData.make || searchContext.lastVehicle?.make;
        const mergedModel = parseData.model || searchContext.lastVehicle?.model;
        
        searchParams = {
          query: parseData.partType || parseData.query,
          year: mergedYear,
          make: mergedMake,
          model: mergedModel,
          category: parseData.vehicleType
        };
        
        // Update context
        searchContext.lastQuery = parseData.query;
        if (parseData.year || parseData.make) {
          searchContext.lastVehicle = {
            type: parseData.vehicleType,
            year: mergedYear,
            make: mergedMake,
            model: mergedModel
          };
        }
      }

      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: chatData.response,
        searchParams
      }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "Oops! I'm having trouble connecting. Check your internet and try again!" 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || rateLimitError) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "That doesn't look like an image. Please upload a JPG, PNG, or similar photo." 
      }]);
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "That image is too large (over 20MB). Please try a smaller photo." 
      }]);
      return;
    }

    setIsUploading(true);
    setMessages(prev => [...prev, { 
      role: "user", 
      content: `📷 Uploaded: ${file.name}`,
      isImageUpload: true
    }]);

    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          const base64Data = result.split(',')[1];
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const res = await fetch("/api/ai/identify-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64 })
      });

      const result = await res.json();
      
      if (handleApiError(res, result)) {
        setMessages(prev => [...prev, { 
          role: "assistant", 
          content: "I need a short break - too many requests! Please wait a moment and try again."
        }]);
        return;
      }
      
      let searchParams: SearchParams | undefined;
      
      if (result.success) {
        if (result.vehicleInfo) {
          searchContext.lastVehicle = result.vehicleInfo;
          searchParams = {
            query: result.suggestions?.[0] || `${result.vehicleInfo.make} ${result.vehicleInfo.model} parts`,
            year: result.vehicleInfo.year,
            make: result.vehicleInfo.make,
            model: result.vehicleInfo.model,
            category: result.vehicleInfo.type
          };
        } else if (result.partInfo) {
          searchContext.lastPart = result.partInfo;
          searchParams = {
            query: result.partInfo.name || result.partInfo.partNumber || result.suggestions?.[0] || ''
          };
        }
      }

      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: result.message,
        searchParams,
        imageIdentification: {
          success: result.success,
          vehicleInfo: result.vehicleInfo,
          partInfo: result.partInfo,
          confidence: result.confidence,
          suggestions: result.suggestions || []
        }
      }]);
    } catch (error) {
      console.error("Image upload error:", error);
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "Something went wrong uploading that image. Please try again or describe what you need instead." 
      }]);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSearch = (searchParams: SearchParams) => {
    if (!searchParams) return;
    const url = buildSearchUrl(searchParams);
    navigate(url);
    setIsOpen(false);
  };

  const renderVehicleInfo = (info: VehicleInfo, confidence: number) => (
    <Card className="mt-2 p-3 bg-green-500/10 border-green-500/30">
      <div className="flex items-center gap-2 mb-2">
        <CheckCircle2 className="w-4 h-4 text-green-500" />
        <span className="text-xs font-medium text-green-400">Vehicle Identified ({confidence}% confidence)</span>
      </div>
      <div className="flex items-center gap-2">
        <Car className="w-5 h-5 text-primary" />
        <div className="text-sm">
          <span className="font-medium">
            {[info.year, info.make, info.model].filter(Boolean).join(' ')}
          </span>
          {info.engine && <span className="text-muted-foreground ml-1">({info.engine})</span>}
        </div>
      </div>
      {info.type && (
        <Badge variant="secondary" className="mt-2 text-xs">{info.type}</Badge>
      )}
    </Card>
  );

  const renderPartInfo = (info: PartInfo, confidence: number) => (
    <Card className="mt-2 p-3 bg-blue-500/10 border-blue-500/30">
      <div className="flex items-center gap-2 mb-2">
        <CheckCircle2 className="w-4 h-4 text-blue-500" />
        <span className="text-xs font-medium text-blue-400">Part Identified ({confidence}% confidence)</span>
      </div>
      <div className="text-sm">
        <span className="font-medium">{info.name}</span>
        {info.partNumber && (
          <Badge variant="outline" className="ml-2 text-xs">#{info.partNumber}</Badge>
        )}
      </div>
      {info.description && (
        <p className="text-xs text-muted-foreground mt-1">{info.description}</p>
      )}
      {info.condition && (
        <Badge variant={info.condition === 'new' ? 'default' : 'secondary'} className="mt-2 text-xs">
          {info.condition}
        </Badge>
      )}
    </Card>
  );

  const quickActions = [
    { label: "Find brake pads", query: "I need brake pads for my car" },
    { label: "Oil filter", query: "Looking for an oil filter" },
    { label: "ATV carburetor", query: "I have an ATV that needs a new carburetor" },
  ];

  const ComicSpeechBubble = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <div className={`relative ${className}`}>
      <svg 
        viewBox="0 0 400 280" 
        className="w-full h-full absolute inset-0"
        preserveAspectRatio="none"
        style={{ filter: 'drop-shadow(0 4px 12px rgba(0, 255, 255, 0.2))' }}
      >
        <ellipse 
          cx="200" 
          cy="130" 
          rx="195" 
          ry="125" 
          fill="hsl(var(--card))" 
          stroke="hsl(var(--primary))" 
          strokeWidth="3"
        />
        <path 
          d="M 320 230 Q 350 260 380 270 Q 340 250 330 240" 
          fill="hsl(var(--card))" 
          stroke="hsl(var(--primary))" 
          strokeWidth="3"
        />
        <ellipse 
          cx="200" 
          cy="130" 
          rx="190" 
          ry="120" 
          fill="hsl(var(--card))"
        />
      </svg>
      <div className="relative z-10 p-6">
        {children}
      </div>
    </div>
  );

  return (
    <>
      <AnimatePresence>
        {isOpen && !isMinimized && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isExiting ? 0 : 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={handleClose}
            data-testid="ai-mascot-overlay"
          >
            <motion.div
              initial={{ x: -500, opacity: 0, rotate: 15 }}
              animate={{ 
                x: isExiting ? 600 : 0, 
                opacity: isExiting ? 0 : 1,
                rotate: isExiting ? -15 : 0,
                transition: {
                  type: "spring",
                  damping: isExiting ? 25 : 20,
                  stiffness: isExiting ? 400 : 300,
                  mass: 0.8
                }
              }}
              exit={{ x: 600, opacity: 0, rotate: -15 }}
              className="fixed bottom-4 left-4 md:left-8 flex flex-col items-start"
              onClick={(e) => e.stopPropagation()}
              data-testid="ai-mascot-chat"
            >
              <div className="relative w-80 md:w-[420px] h-[320px] mb-[-30px]">
                <ComicSpeechBubble>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-tech font-bold text-sm uppercase text-primary">{mascotName}</h3>
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6"
                        onClick={() => setIsMinimized(true)}
                        data-testid="ai-mascot-minimize"
                      >
                        <ChevronDown className="w-3 h-3" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6"
                        onClick={handleClose}
                        data-testid="ai-mascot-close"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  <ScrollArea className="h-36 mb-2" ref={scrollRef}>
                    <div className="space-y-3 pr-2">
                      {messages.map((msg, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
                        >
                          <div className={`max-w-[95%] rounded-xl px-3 py-2 ${
                            msg.role === "user" 
                              ? "bg-primary text-primary-foreground" 
                              : "bg-muted/80"
                          }`}>
                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                          </div>
                          
                          {msg.imageIdentification?.success && msg.imageIdentification.vehicleInfo && (
                            renderVehicleInfo(msg.imageIdentification.vehicleInfo, msg.imageIdentification.confidence)
                          )}
                          
                          {msg.imageIdentification?.success && msg.imageIdentification.partInfo && (
                            renderPartInfo(msg.imageIdentification.partInfo, msg.imageIdentification.confidence)
                          )}
                          
                          {msg.searchParams && (
                            <Button
                              size="sm"
                              className="mt-2 text-xs bg-primary hover:bg-primary/90"
                              onClick={() => handleSearch(msg.searchParams!)}
                              data-testid={`search-action-${i}`}
                            >
                              <Search className="w-3 h-3 mr-1" />
                              Search for parts
                              <ExternalLink className="w-3 h-3 ml-1" />
                            </Button>
                          )}
                          
                          {msg.imageIdentification?.success && msg.imageIdentification.suggestions.length > 1 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              <span className="text-[10px] text-muted-foreground w-full mb-1">Related searches:</span>
                              {msg.imageIdentification.suggestions.slice(0, 4).map((suggestion, j) => (
                                <Badge 
                                  key={j}
                                  variant="outline"
                                  className="cursor-pointer hover:bg-primary/20 text-xs"
                                  onClick={() => handleSearch({ query: suggestion })}
                                >
                                  {suggestion}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      ))}
                      
                      {(isLoading || isUploading) && (
                        <div className="flex justify-start">
                          <div className="bg-muted/80 rounded-xl px-3 py-2">
                            <div className="flex items-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin text-primary" />
                              <span className="text-sm text-muted-foreground">
                                {isUploading ? "Analyzing..." : "Thinking..."}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>

                  {rateLimitError && (
                    <div className="flex items-center gap-2 text-amber-500 mb-2">
                      <AlertCircle className="w-3 h-3" />
                      <span className="text-xs">Wait {rateLimitError.retryAfter}s</span>
                    </div>
                  )}

                  {messages.length <= 1 && !rateLimitError && (
                    <div className="mb-2">
                      <div className="flex flex-wrap gap-1">
                        {quickActions.map((action, i) => (
                          <Badge 
                            key={i}
                            variant="outline" 
                            className="cursor-pointer hover:bg-primary/10 hover:border-primary transition-colors text-xs"
                            onClick={() => setInput(action.query)}
                            data-testid={`quick-action-${i}`}
                          >
                            <Lightbulb className="w-3 h-3 mr-1" />
                            {action.label}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      className="hidden"
                      data-testid="ai-mascot-file-input"
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="shrink-0 h-9 w-9"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isLoading || isUploading || !!rateLimitError}
                      title="Upload image"
                      data-testid="ai-mascot-camera"
                    >
                      <Camera className="w-4 h-4" />
                    </Button>
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                      placeholder={rateLimitError ? "Please wait..." : "Describe what you need..."}
                      className="flex-1 text-sm h-9"
                      disabled={isLoading || isUploading || !!rateLimitError}
                      data-testid="ai-mascot-input"
                    />
                    <Button 
                      size="icon" 
                      onClick={sendMessage}
                      disabled={!input.trim() || isLoading || isUploading || !!rateLimitError}
                      className="shrink-0 h-9 w-9"
                      data-testid="ai-mascot-send"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </ComicSpeechBubble>
              </div>
              
              <motion.img
                src={isLoading ? mascotThinking : mascotWaving}
                alt="Buddy the GarageBot mascot"
                className="w-36 h-36 md:w-44 md:h-44 object-contain ml-8"
                style={{ 
                  filter: 'drop-shadow(0 4px 12px rgba(0, 255, 255, 0.4)) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))',
                }}
                initial={{ x: -100, rotate: 15, scale: 0.9 }}
                animate={{ 
                  x: isExiting ? 100 : 0, 
                  rotate: isExiting ? -20 : 0,
                  scale: isExiting ? 0.9 : 1,
                  transition: {
                    type: "spring",
                    damping: 12,
                    stiffness: 200,
                  }
                }}
                data-testid="ai-mascot-image"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && isMinimized && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 right-4 z-50"
          >
            <Button
              onClick={() => setIsMinimized(false)}
              className="rounded-full px-4 py-2 bg-card border border-primary/30 text-foreground hover:bg-primary/10"
              data-testid="ai-mascot-restore"
            >
              <img 
                src={mascotWaving} 
                alt="Buddy" 
                className="w-8 h-8 mr-2"
                style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 255, 255, 0.3))' }}
              />
              <span className="font-tech text-sm">{mascotName}</span>
              <Badge className="ml-2 bg-primary/20 text-primary text-xs">
                {messages.length - 1} msgs
              </Badge>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          if (isOpen) {
            handleClose();
          } else {
            setIsOpen(true);
            setIsMinimized(false);
          }
        }}
        className="fixed bottom-4 right-4 z-50 p-0 bg-transparent border-0 cursor-pointer"
        style={{ background: 'none' }}
        data-testid="ai-mascot-toggle"
      >
        {isOpen ? (
          <motion.div 
            className="w-16 h-16 rounded-full bg-card border-2 border-primary/50 flex items-center justify-center"
            style={{ filter: 'drop-shadow(0 4px 8px rgba(0, 255, 255, 0.3))' }}
          >
            <X className="w-6 h-6 text-primary" />
          </motion.div>
        ) : (
          <div className="relative">
            <motion.img 
              src={mascotWaving} 
              alt="Chat with Buddy" 
              className="w-24 h-24 object-contain"
              style={{ 
                filter: 'drop-shadow(0 4px 12px rgba(0, 255, 255, 0.4)) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))',
              }}
              animate={{
                y: [0, -5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <Sparkles className="w-4 h-4 text-yellow-300 absolute top-0 right-0 animate-pulse" />
          </div>
        )}
      </motion.button>
    </>
  );
}
