import { useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import Nav from "@/components/Nav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { 
  BookOpen, Search, Car, Wrench, ChevronLeft, ChevronRight, Clock, 
  Gauge, AlertTriangle, CheckCircle2, Filter, X, Play, Pause,
  RotateCcw, Download, Share2, Bookmark, ThumbsUp, ArrowRight,
  Lightbulb, ShoppingCart, ExternalLink, Zap, Anchor, Bike, Truck
} from "lucide-react";

type RepairCategory = "basic" | "intermediate" | "advanced";
type VehicleType = "car" | "truck" | "motorcycle" | "boat" | "atv" | "small-engine";

interface RepairGuide {
  id: string;
  title: string;
  description: string;
  category: RepairCategory;
  vehicleType: VehicleType;
  estimatedTime: string;
  difficulty: number;
  toolsNeeded: string[];
  partsNeeded: string[];
  steps: GuideStep[];
  compatibleVehicles: string[];
  viewCount: number;
  helpfulCount: number;
}

interface GuideStep {
  stepNumber: number;
  title: string;
  description: string;
  imageUrl?: string;
  tips?: string[];
  warnings?: string[];
}

const sampleGuides: RepairGuide[] = [
  {
    id: "oil-change-basic",
    title: "Oil Change",
    description: "Complete guide to changing your engine oil and filter. Learn the proper way to drain old oil, replace the filter, and add fresh oil.",
    category: "basic",
    vehicleType: "car",
    estimatedTime: "30-45 min",
    difficulty: 1,
    toolsNeeded: ["Oil drain pan", "Socket wrench set", "Oil filter wrench", "Funnel", "Jack stands"],
    partsNeeded: ["Engine oil (check your owner's manual for type)", "Oil filter"],
    compatibleVehicles: ["All cars and trucks"],
    viewCount: 15420,
    helpfulCount: 14200,
    steps: [
      { stepNumber: 1, title: "Prepare Your Vehicle", description: "Park on a level surface. If needed, use jack stands to safely raise the front of the vehicle. Never work under a car supported only by a jack.", tips: ["Warm up the engine for 2-3 minutes - warm oil drains faster"], warnings: ["Never get under a vehicle supported only by a jack"] },
      { stepNumber: 2, title: "Locate the Drain Plug", description: "Find the oil drain plug on the bottom of the engine oil pan. It's usually a bolt at the lowest point of the oil pan.", tips: ["Take a photo before removing anything so you remember where parts go"] },
      { stepNumber: 3, title: "Drain the Old Oil", description: "Place your drain pan under the plug. Using the correct size socket, loosen and remove the drain plug. Let the oil drain completely - this takes about 5 minutes.", warnings: ["Oil may be hot - wear gloves", "Don't drop the drain plug into the oil pan"] },
      { stepNumber: 4, title: "Replace the Drain Plug", description: "Once drained, wipe the drain plug clean. Replace the washer if included with your new filter. Hand-thread the plug back in, then tighten snugly with your wrench. Don't over-tighten.", tips: ["Hand-start the plug to avoid cross-threading"] },
      { stepNumber: 5, title: "Remove the Old Filter", description: "Locate the oil filter. Place the drain pan underneath. Use an oil filter wrench to loosen and remove the old filter. Some oil will spill out.", tips: ["The filter is usually on the side of the engine block"] },
      { stepNumber: 6, title: "Install the New Filter", description: "Apply a thin layer of new oil to the rubber gasket on the new filter. This helps create a good seal. Hand-tighten the filter - usually 3/4 to 1 full turn after the gasket contacts the surface.", warnings: ["Don't use a wrench to tighten the new filter - hand tight only"] },
      { stepNumber: 7, title: "Add New Oil", description: "Remove the oil filler cap on top of the engine. Using a funnel, add the correct amount and type of oil specified in your owner's manual.", tips: ["Add oil slowly and check the dipstick as you go"] },
      { stepNumber: 8, title: "Check for Leaks", description: "Start the engine and let it run for a minute. Check under the vehicle for any leaks around the drain plug and filter. Turn off the engine, wait 2 minutes, then check the oil level with the dipstick.", tips: ["Add more oil if needed to reach the 'full' mark"] }
    ]
  },
  {
    id: "brake-pads-front",
    title: "Front Brake Pad Replacement",
    description: "Step-by-step guide to replacing your front brake pads. Includes proper caliper handling, rotor inspection, and bedding-in procedure.",
    category: "intermediate",
    vehicleType: "car",
    estimatedTime: "1-2 hours",
    difficulty: 3,
    toolsNeeded: ["Socket wrench set", "C-clamp or brake caliper tool", "Jack and jack stands", "Lug wrench", "Wire brush", "Brake cleaner"],
    partsNeeded: ["Brake pads (front set)", "Brake hardware kit (recommended)", "Brake grease"],
    compatibleVehicles: ["Most cars and light trucks 1990-present"],
    viewCount: 8934,
    helpfulCount: 8100,
    steps: [
      { stepNumber: 1, title: "Safety First", description: "Park on level ground. Loosen lug nuts before jacking. Raise vehicle and secure on jack stands. Remove the wheel.", warnings: ["Always use jack stands - never work under a car on just a jack", "Let brakes cool if vehicle was recently driven"] },
      { stepNumber: 2, title: "Inspect the Brake Assembly", description: "Look at your current brake pads, rotor, and caliper. Check rotor thickness and surface condition. Deep grooves may mean you need new rotors too.", tips: ["Take photos of the assembly before disassembly"] },
      { stepNumber: 3, title: "Remove the Caliper", description: "Remove the caliper slide bolts (usually two bolts on the back). Don't let the caliper hang by the brake hose - use a wire or bungee to support it.", warnings: ["Never let the caliper hang by the brake line - it can cause damage"] },
      { stepNumber: 4, title: "Remove Old Pads", description: "Slide out the old brake pads. Note how they're positioned - the new ones go in the same way. Check the pad wear indicators if present.", tips: ["The inner and outer pads may be different - note which is which"] },
      { stepNumber: 5, title: "Compress the Caliper Piston", description: "Use a C-clamp or brake caliper tool to slowly push the piston back into the caliper. This makes room for the new, thicker pads.", warnings: ["Check your brake fluid reservoir - fluid may overflow when compressing piston", "Some vehicles require the piston to be twisted while compressing"] },
      { stepNumber: 6, title: "Install New Pads", description: "Apply brake grease to the backs of the new pads (where they contact the caliper, not the friction surface). Install the new hardware clips if included. Slide in the new pads.", tips: ["Make sure pads are seated correctly in the bracket"] },
      { stepNumber: 7, title: "Reinstall the Caliper", description: "Slide the caliper back over the new pads and rotor. Reinstall and tighten the caliper bolts to spec. Clean any grease from the rotor surface with brake cleaner.", tips: ["Torque bolts to manufacturer specifications"] },
      { stepNumber: 8, title: "Repeat and Test", description: "Repeat for the other side. Reinstall wheels and lower vehicle. Before driving, pump the brake pedal several times until it feels firm. Test brakes at low speed.", warnings: ["Do not skip pumping the brakes - your first stop could have no braking!", "Bed in new pads with gentle stops for the first 100 miles"] }
    ]
  },
  {
    id: "headlight-bulb",
    title: "Headlight Bulb Replacement",
    description: "Quick guide to replacing your headlight bulbs. Covers halogen, HID, and LED bulb types with tips for different vehicle configurations.",
    category: "basic",
    vehicleType: "car",
    estimatedTime: "15-30 min",
    difficulty: 1,
    toolsNeeded: ["Gloves (for halogen bulbs)", "Screwdriver (some vehicles)"],
    partsNeeded: ["Replacement headlight bulb (correct type for your vehicle)"],
    compatibleVehicles: ["Most cars and trucks"],
    viewCount: 12100,
    helpfulCount: 11500,
    steps: [
      { stepNumber: 1, title: "Identify Your Bulb Type", description: "Check your owner's manual or the existing bulb for the correct replacement type. Common types include H11, 9005, 9006, H7, and H1.", tips: ["Buy bulbs in pairs - if one burned out, the other is likely close behind"] },
      { stepNumber: 2, title: "Access the Headlight", description: "Open your hood and locate the back of the headlight housing. Some vehicles require removing the air filter box or battery for access.", tips: ["Take a photo of the connector before removal"] },
      { stepNumber: 3, title: "Remove the Connector", description: "Disconnect the electrical connector from the back of the bulb. It usually has a tab to press or squeeze.", warnings: ["Don't pull on the wires - grip the connector housing"] },
      { stepNumber: 4, title: "Remove the Old Bulb", description: "Remove the dust cover if present. The bulb is typically held by a spring clip, twist-lock, or retaining ring. Carefully remove the old bulb.", warnings: ["Don't touch halogen bulbs with bare hands - oils cause hot spots and early failure"] },
      { stepNumber: 5, title: "Install the New Bulb", description: "Wearing gloves for halogen bulbs, insert the new bulb. Make sure it's seated properly - there's usually a notch or tab for correct alignment. Secure with the clip or twist-lock.", tips: ["If you touch the bulb, clean it with rubbing alcohol"] },
      { stepNumber: 6, title: "Test and Finish", description: "Reconnect the electrical connector. Turn on your headlights to test. Replace the dust cover and any parts you removed for access.", tips: ["Check both low and high beams"] }
    ]
  },
  {
    id: "air-filter",
    title: "Engine Air Filter Replacement",
    description: "Simple guide to replacing your engine air filter for better fuel economy and engine performance.",
    category: "basic",
    vehicleType: "car",
    estimatedTime: "10-15 min",
    difficulty: 1,
    toolsNeeded: ["None (some vehicles may need a screwdriver)"],
    partsNeeded: ["Engine air filter (correct size for your vehicle)"],
    compatibleVehicles: ["All cars and trucks"],
    viewCount: 9870,
    helpfulCount: 9500,
    steps: [
      { stepNumber: 1, title: "Locate the Air Filter Box", description: "Open your hood and find the air filter housing. It's usually a black plastic box near the front of the engine with a large hose connected to it.", tips: ["The air filter box is usually on the driver's side"] },
      { stepNumber: 2, title: "Open the Housing", description: "Release the clips or screws holding the air filter housing closed. Some vehicles use spring clips, others use screws.", tips: ["Note the orientation of the clips for reassembly"] },
      { stepNumber: 3, title: "Remove the Old Filter", description: "Lift out the old air filter and inspect it. Hold it up to light - if you can't see light through it, it definitely needs replacing.", tips: ["A dirty filter reduces fuel economy and engine power"] },
      { stepNumber: 4, title: "Clean the Housing", description: "Use a clean rag or vacuum to remove any debris from inside the air filter housing. This prevents dirt from getting into your engine.", warnings: ["Don't use compressed air - it can push debris deeper into the intake"] },
      { stepNumber: 5, title: "Install the New Filter", description: "Place the new filter in the housing, making sure it sits flat and is oriented correctly. Most filters only fit one way.", tips: ["Check that the filter edges are fully seated in the housing"] },
      { stepNumber: 6, title: "Close and Secure", description: "Replace the housing cover and secure all clips or screws. Make sure the housing is completely sealed.", tips: ["An air leak will let unfiltered air into your engine"] }
    ]
  },
  {
    id: "spark-plugs",
    title: "Spark Plug Replacement",
    description: "Complete guide to replacing spark plugs for improved engine performance and fuel efficiency.",
    category: "intermediate",
    vehicleType: "car",
    estimatedTime: "45 min - 1.5 hours",
    difficulty: 2,
    toolsNeeded: ["Spark plug socket", "Socket wrench with extension", "Torque wrench", "Gap gauge", "Dielectric grease", "Anti-seize compound"],
    partsNeeded: ["Spark plugs (correct type and quantity for your engine)"],
    compatibleVehicles: ["All gasoline engines"],
    viewCount: 7650,
    helpfulCount: 7100,
    steps: [
      { stepNumber: 1, title: "Let the Engine Cool", description: "Never work on spark plugs with a hot engine. Let it cool for at least an hour to avoid burns and to prevent thread damage.", warnings: ["Hot engines can cause severe burns", "Installing plugs in a hot engine can damage threads"] },
      { stepNumber: 2, title: "Access the Spark Plugs", description: "Locate your spark plugs. On most engines, they're under the ignition coils. You may need to remove an engine cover first.", tips: ["Work on one cylinder at a time to avoid mixing up wires"] },
      { stepNumber: 3, title: "Remove the Ignition Coil", description: "Disconnect the electrical connector from the coil. Remove the bolt holding the coil in place. Pull the coil straight up and out.", tips: ["Twist gently while pulling if the coil is stuck"] },
      { stepNumber: 4, title: "Remove the Old Plug", description: "Use the spark plug socket with extension to unscrew the old plug. Turn counter-clockwise. If it's very tight, don't force it - apply penetrating oil and wait.", warnings: ["If a plug won't come out easily, don't force it - you could damage the threads"] },
      { stepNumber: 5, title: "Check the Gap", description: "Verify the gap on your new plug matches your vehicle's specification (found in owner's manual). Use a gap gauge to check and adjust if needed.", tips: ["Most pre-gapped plugs still need verification"] },
      { stepNumber: 6, title: "Install the New Plug", description: "Apply a small amount of anti-seize to the threads (not the electrode). Hand-thread the new plug to avoid cross-threading. Final tighten with torque wrench to spec.", warnings: ["Over-tightening can strip threads or crack the plug"] },
      { stepNumber: 7, title: "Reinstall the Coil", description: "Apply a thin layer of dielectric grease to the inside of the coil boot. Push the coil firmly onto the plug. Reinstall the bolt and reconnect the electrical connector.", tips: ["You should feel/hear the coil click onto the plug"] },
      { stepNumber: 8, title: "Repeat and Test", description: "Repeat for remaining cylinders. Start the engine and check for smooth idle. Listen for any misfires or unusual sounds.", tips: ["A rough idle after installation usually means a plug isn't seated correctly"] }
    ]
  }
];

const categoryInfo = {
  basic: { label: "Basic", color: "bg-green-500", description: "Beginner-friendly repairs" },
  intermediate: { label: "Intermediate", color: "bg-yellow-500", description: "Some experience helpful" },
  advanced: { label: "Advanced", color: "bg-red-500", description: "Experienced DIYers" }
};

const vehicleTypeIcons: Record<VehicleType, typeof Car> = {
  car: Car,
  truck: Truck,
  motorcycle: Bike,
  boat: Anchor,
  atv: Zap,
  "small-engine": Wrench
};

export default function DIYGuides() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<RepairCategory | "all">("all");
  const [selectedVehicleType, setSelectedVehicleType] = useState<VehicleType | "all">("all");
  const [selectedGuide, setSelectedGuide] = useState<RepairGuide | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(false);

  const filteredGuides = sampleGuides.filter(guide => {
    const matchesSearch = guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guide.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || guide.category === selectedCategory;
    const matchesType = selectedVehicleType === "all" || guide.vehicleType === selectedVehicleType;
    return matchesSearch && matchesCategory && matchesType;
  });

  const nextStep = () => {
    if (selectedGuide && currentStep < selectedGuide.steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/40 bg-primary/10 text-primary text-xs font-mono tracking-wider mb-4">
            <BookOpen className="w-4 h-4" />
            DIY REPAIR GUIDES
          </div>
          
          <h1 className="text-3xl md:text-4xl font-tech font-bold uppercase mb-2">
            Step-by-Step <span className="text-primary">Repair Guides</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Go at your own pace. No more pausing and rewinding YouTube videos.
            Each guide is tailored to your specific vehicle.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-4 justify-center mb-8"
        >
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search repairs..."
              className="pl-10"
              data-testid="input-search-guides"
            />
          </div>
          
          <Select value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as RepairCategory | "all")}>
            <SelectTrigger className="w-40" data-testid="select-category">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="basic">Basic</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedVehicleType} onValueChange={(v) => setSelectedVehicleType(v as VehicleType | "all")}>
            <SelectTrigger className="w-40" data-testid="select-vehicle-type">
              <SelectValue placeholder="Vehicle Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="car">Cars</SelectItem>
              <SelectItem value="truck">Trucks</SelectItem>
              <SelectItem value="motorcycle">Motorcycles</SelectItem>
              <SelectItem value="boat">Boats</SelectItem>
              <SelectItem value="atv">ATVs/UTVs</SelectItem>
              <SelectItem value="small-engine">Small Engines</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid grid-cols-3 max-w-md mx-auto mb-6">
            <TabsTrigger value="basic" className="font-tech uppercase text-xs gap-1">
              <CheckCircle2 className="w-3 h-3" /> Basic
            </TabsTrigger>
            <TabsTrigger value="intermediate" className="font-tech uppercase text-xs gap-1">
              <Gauge className="w-3 h-3" /> Intermediate
            </TabsTrigger>
            <TabsTrigger value="advanced" className="font-tech uppercase text-xs gap-1">
              <AlertTriangle className="w-3 h-3" /> Advanced
            </TabsTrigger>
          </TabsList>

          {["basic", "intermediate", "advanced"].map((cat) => (
            <TabsContent key={cat} value={cat}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredGuides
                  .filter(g => g.category === cat)
                  .map((guide, idx) => {
                    const VehicleIcon = vehicleTypeIcons[guide.vehicleType];
                    return (
                      <motion.div
                        key={guide.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <Card 
                          className="p-4 bg-card/50 border-primary/20 hover:border-primary/50 transition-all cursor-pointer group"
                          onClick={() => { setSelectedGuide(guide); setCurrentStep(0); }}
                          data-testid={`card-guide-${guide.id}`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                                <VehicleIcon className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <h3 className="font-tech font-bold text-foreground group-hover:text-primary transition-colors">
                                  {guide.title}
                                </h3>
                                <p className="text-xs text-muted-foreground">{guide.steps.length} steps</p>
                              </div>
                            </div>
                            <Badge className={`${categoryInfo[guide.category].color} text-black text-[10px]`}>
                              {categoryInfo[guide.category].label}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {guide.description}
                          </p>
                          
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {guide.estimatedTime}
                            </div>
                            <div className="flex items-center gap-1">
                              <ThumbsUp className="w-3 h-3" />
                              {guide.helpfulCount.toLocaleString()} helpful
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    );
                  })}
              </div>
              
              {filteredGuides.filter(g => g.category === cat).length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Wrench className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No guides found matching your criteria</p>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>

        <Dialog open={!!selectedGuide} onOpenChange={(open) => !open && setSelectedGuide(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {selectedGuide && (
              <>
                <DialogHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <DialogTitle className="text-2xl font-tech uppercase text-primary">
                        {selectedGuide.title}
                      </DialogTitle>
                      <DialogDescription className="text-muted-foreground">
                        Step {currentStep + 1} of {selectedGuide.steps.length}
                      </DialogDescription>
                    </div>
                    <Badge className={`${categoryInfo[selectedGuide.category].color} text-black`}>
                      {categoryInfo[selectedGuide.category].label}
                    </Badge>
                  </div>
                  
                  <div className="w-full bg-black/30 rounded-full h-2 mt-4">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((currentStep + 1) / selectedGuide.steps.length) * 100}%` }}
                    />
                  </div>
                </DialogHeader>
                
                <div className="flex-1 overflow-auto py-6">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentStep}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="mb-4">
                        <h3 className="text-xl font-bold mb-2">
                          Step {selectedGuide.steps[currentStep].stepNumber}: {selectedGuide.steps[currentStep].title}
                        </h3>
                        <p className="text-muted-foreground text-lg leading-relaxed">
                          {selectedGuide.steps[currentStep].description}
                        </p>
                      </div>
                      
                      {selectedGuide.steps[currentStep].tips && (
                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Lightbulb className="w-5 h-5 text-blue-400" />
                            <span className="font-medium text-blue-400">Pro Tips</span>
                          </div>
                          <ul className="space-y-1">
                            {selectedGuide.steps[currentStep].tips?.map((tip, i) => (
                              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {selectedGuide.steps[currentStep].warnings && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="w-5 h-5 text-red-400" />
                            <span className="font-medium text-red-400">Warnings</span>
                          </div>
                          <ul className="space-y-1">
                            {selectedGuide.steps[currentStep].warnings?.map((warning, i) => (
                              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                <X className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                                {warning}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                  
                  {currentStep === 0 && (
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className="p-4 bg-black/30 border-white/10">
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <Wrench className="w-4 h-4 text-primary" /> Tools Needed
                        </h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {selectedGuide.toolsNeeded.map((tool, i) => (
                            <li key={i}>• {tool}</li>
                          ))}
                        </ul>
                      </Card>
                      <Card className="p-4 bg-black/30 border-white/10">
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <ShoppingCart className="w-4 h-4 text-green-400" /> Parts Needed
                        </h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {selectedGuide.partsNeeded.map((part, i) => (
                            <li key={i} className="flex items-center justify-between">
                              <span>• {part}</span>
                              <Button variant="ghost" size="sm" className="h-6 text-xs text-primary">
                                Find Parts <ExternalLink className="w-3 h-3 ml-1" />
                              </Button>
                            </li>
                          ))}
                        </ul>
                      </Card>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 0}
                    className="gap-2"
                    data-testid="button-prev-step"
                  >
                    <ChevronLeft className="w-4 h-4" /> Previous
                  </Button>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" title="Restart">
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Save Guide">
                      <Bookmark className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Share">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {currentStep === selectedGuide.steps.length - 1 ? (
                    <Button
                      onClick={() => setSelectedGuide(null)}
                      className="bg-green-500 hover:bg-green-600 text-black gap-2"
                      data-testid="button-complete"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Complete!
                    </Button>
                  ) : (
                    <Button
                      onClick={nextStep}
                      className="bg-primary hover:bg-primary/90 text-black gap-2"
                      data-testid="button-next-step"
                    >
                      Next Step <ChevronRight className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
