import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { 
  BookOpen, Search, Car, Wrench, ChevronLeft, ChevronRight, Clock, 
  Gauge, AlertTriangle, CheckCircle2, Play, Pause,
  Lightbulb, ExternalLink, Zap, Anchor, Bike, Truck,
  Youtube, Snowflake, Crown, Flame, Lock, Sparkles, Ship
} from "lucide-react";

interface RepairGuide {
  id: number;
  title: string;
  slug: string;
  description: string;
  category: string;
  difficulty: string;
  estimatedTimeMinutes: number;
  partsCost: string;
  toolsRequired: string[];
  partsRequired: string[];
  safetyWarnings: string[];
  youtubeSearchTerm: string;
  tags: string[];
  isPopular: boolean;
  isPremium: boolean;
  steps: GuideStep[];
}

interface GuideStep {
  id: number;
  stepNumber: number;
  title: string;
  description: string;
  proTips: string[] | null;
  warnings: string[] | null;
  videoUrl: string | null;
  youtubeTimestamp: string | null;
}

const EQUIPMENT_CATEGORIES = [
  { id: "car", name: "Cars & Trucks", icon: Car, color: "from-blue-500/20 to-blue-600/10" },
  { id: "motorcycle", name: "Motorcycles", icon: Bike, color: "from-orange-500/20 to-orange-600/10" },
  { id: "boat", name: "Boats & Marine", icon: Anchor, color: "from-cyan-500/20 to-cyan-600/10" },
  { id: "atv", name: "ATVs & UTVs", icon: Zap, color: "from-green-500/20 to-green-600/10" },
  { id: "small-engine", name: "Small Engines", icon: Wrench, color: "from-amber-500/20 to-amber-600/10" },
  { id: "rv", name: "RVs & Motorhomes", icon: Truck, color: "from-purple-500/20 to-purple-600/10" },
  { id: "diesel", name: "Diesel & Commercial", icon: Ship, color: "from-slate-500/20 to-slate-600/10" },
  { id: "classic", name: "Classics & Hot Rods", icon: Flame, color: "from-red-500/20 to-red-600/10" },
];

const difficultyInfo: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  beginner: { label: "Beginner", color: "bg-green-500", icon: CheckCircle2 },
  intermediate: { label: "Intermediate", color: "bg-yellow-500", icon: Gauge },
  advanced: { label: "Advanced", color: "bg-red-500", icon: AlertTriangle },
};

export default function DIYGuides() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGuide, setSelectedGuide] = useState<RepairGuide | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(["car", "motorcycle", "boat", "atv"]);
  const { user } = useAuth();
  const isPro = user?.subscriptionTier === 'pro' || user?.subscriptionTier === 'founder';

  const { data: guides = [], isLoading } = useQuery<RepairGuide[]>({
    queryKey: ["/api/diy-guides"],
    staleTime: 1000 * 60 * 5,
  });

  const filteredGuides = guides.filter(guide => {
    if (!searchQuery) return true;
    return guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guide.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guide.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  const getGuidesByCategory = (categoryId: string) => {
    return filteredGuides.filter(g => g.category === categoryId);
  };

  const getCategoryCount = (categoryId: string) => {
    return filteredGuides.filter(g => g.category === categoryId).length;
  };

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

  const openGuide = async (guide: RepairGuide) => {
    if (guide.isPremium && !isPro) {
      return;
    }
    
    // Fetch full guide with steps from individual endpoint
    try {
      const response = await fetch(`/api/diy-guides/${guide.slug}`);
      if (response.ok) {
        const fullGuide = await response.json();
        setSelectedGuide(fullGuide);
      } else {
        // Fallback to listing data if detail fetch fails
        setSelectedGuide(guide);
      }
    } catch (error) {
      console.error("Error fetching guide details:", error);
      setSelectedGuide(guide);
    }
    setCurrentStep(0);
  };

  const generateYoutubeUrl = (term: string) => {
    return `https://www.youtube.com/results?search_query=${encodeURIComponent(term)}`;
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      
      <div className="max-w-6xl mx-auto px-4 pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-6"
        >
          <Card className="md:col-span-8 bg-card/50 border-primary/20 p-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/40 bg-primary/10 text-primary text-[10px] font-mono tracking-wider mb-2">
              <BookOpen className="w-3 h-3" />
              DIY REPAIR GUIDES
            </div>
            <h1 className="text-xl font-tech font-bold uppercase">
              Step-by-Step <span className="text-primary">Repair Guides</span>
            </h1>
            <p className="text-muted-foreground text-sm">
              Go at your own pace. Detailed steps, pro tips, and video links.
            </p>
          </Card>
          <Card className="md:col-span-4 bg-card/50 border-primary/20 p-4 flex items-center justify-center gap-4">
            <div className="text-center">
              <p className="text-xl font-bold text-green-400">{guides.filter(g => !g.isPremium).length}</p>
              <p className="text-[10px] text-muted-foreground">Free</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-primary">{guides.filter(g => g.isPremium).length}</p>
              <p className="text-[10px] text-muted-foreground">Pro</p>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-lg mx-auto mb-8"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search all repairs..."
              className="pl-10 bg-card/50 border-primary/20 focus:border-primary/50"
              data-testid="input-search-guides"
            />
          </div>
        </motion.div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Accordion 
              type="multiple" 
              value={expandedCategories}
              onValueChange={setExpandedCategories}
              className="space-y-3"
            >
              {EQUIPMENT_CATEGORIES.map((category) => {
                const categoryGuides = getGuidesByCategory(category.id);
                const count = getCategoryCount(category.id);
                const IconComponent = category.icon;
                
                if (count === 0 && searchQuery) return null;
                
                return (
                  <AccordionItem 
                    key={category.id} 
                    value={category.id}
                    className="border border-primary/20 rounded-lg overflow-hidden bg-card/30 backdrop-blur-sm"
                  >
                    <AccordionTrigger 
                      className={`px-4 py-3 hover:no-underline hover:bg-primary/5 transition-all group bg-gradient-to-r ${category.color}`}
                      data-testid={`accordion-${category.id}`}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div className="w-10 h-10 rounded-lg bg-background/50 flex items-center justify-center border border-primary/20 group-hover:border-primary/50 transition-colors">
                          <IconComponent className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 text-left">
                          <h3 className="font-tech font-bold text-foreground group-hover:text-primary transition-colors">
                            {category.name}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {count} guide{count !== 1 ? 's' : ''} available
                          </p>
                        </div>
                        <Badge variant="outline" className="ml-auto mr-2 border-primary/30">
                          {count}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    
                    <AccordionContent className="px-4 pb-4 pt-2">
                      {categoryGuides.length === 0 ? (
                        <p className="text-center text-muted-foreground py-4">
                          No guides found. More coming soon!
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {categoryGuides.map((guide, idx) => {
                            const difficulty = difficultyInfo[guide.difficulty] || difficultyInfo.beginner;
                            const DifficultyIcon = difficulty.icon;
                            const isLocked = guide.isPremium && !isPro;
                            
                            return (
                              <motion.div
                                key={guide.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.03 }}
                              >
                                <Card 
                                  className={`p-4 bg-card/50 border-primary/20 transition-all cursor-pointer group relative overflow-hidden ${
                                    isLocked 
                                      ? 'opacity-75 hover:opacity-90' 
                                      : 'hover:border-primary/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]'
                                  }`}
                                  onClick={() => openGuide(guide)}
                                  data-testid={`card-guide-${guide.slug}`}
                                >
                                  {isLocked && (
                                    <div className="absolute top-2 right-2 z-10">
                                      <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/20 border border-primary/40">
                                        <Lock className="w-3 h-3 text-primary" />
                                        <span className="text-[10px] font-mono text-primary">PRO</span>
                                      </div>
                                    </div>
                                  )}
                                  
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1 pr-8">
                                      <h4 className={`font-tech font-bold text-sm transition-colors line-clamp-1 ${
                                        isLocked ? 'text-foreground/70' : 'text-foreground group-hover:text-primary'
                                      }`}>
                                        {guide.title}
                                      </h4>
                                      <p className="text-xs text-muted-foreground">
                                        {(guide as any).stepCount || guide.steps?.length || 0} steps
                                      </p>
                                    </div>
                                    <Badge className={`${difficulty.color} text-black text-[10px] flex-shrink-0 ${isLocked ? 'mt-6' : ''}`}>
                                      {difficulty.label}
                                    </Badge>
                                  </div>
                                  
                                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                                    {guide.description}
                                  </p>
                                  
                                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <div className="flex items-center gap-3">
                                      <div className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {guide.estimatedTimeMinutes} min
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Wrench className="w-3 h-3" />
                                        ${guide.partsCost}
                                      </div>
                                    </div>
                                    {guide.youtubeSearchTerm && (
                                      <div className="flex items-center gap-1 text-red-400">
                                        <Youtube className="w-3 h-3" />
                                      </div>
                                    )}
                                  </div>
                                  
                                  {isLocked && (
                                    <div className="mt-3 pt-3 border-t border-primary/20">
                                      <Button 
                                        size="sm" 
                                        variant="outline" 
                                        className="w-full text-xs border-primary/40 hover:bg-primary/10"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          window.location.href = '/pro';
                                        }}
                                      >
                                        <Sparkles className="w-3 h-3 mr-1" />
                                        Unlock with Pro
                                      </Button>
                                    </div>
                                  )}
                                </Card>
                              </motion.div>
                            );
                          })}
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </motion.div>
        )}

        {!isPro && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8 p-6 rounded-lg border border-primary/30 bg-gradient-to-r from-primary/10 to-purple-500/10"
          >
            <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                <Crown className="w-8 h-8 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-tech text-lg font-bold mb-1">Unlock All Pro Guides</h3>
                <p className="text-sm text-muted-foreground">
                  Get access to intermediate and advanced repairs for all vehicle types. 
                  Includes CV axles, alternators, carburetors, and more.
                </p>
              </div>
              <Button 
                onClick={() => window.location.href = '/pro'}
                className="btn-glow font-tech uppercase"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Go Pro - $4.99/mo
              </Button>
            </div>
          </motion.div>
        )}
      </div>

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
                      Step {currentStep + 1} of {selectedGuide.steps?.length || 0}
                    </DialogDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedGuide.youtubeSearchTerm && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(generateYoutubeUrl(selectedGuide.youtubeSearchTerm), '_blank')}
                        className="gap-1 text-red-400 border-red-400/30 hover:bg-red-400/10"
                      >
                        <Youtube className="w-4 h-4" />
                        Videos
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsAutoPlay(!isAutoPlay)}
                      className="gap-1"
                    >
                      {isAutoPlay ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      {isAutoPlay ? 'Pause' : 'Auto'}
                    </Button>
                  </div>
                </div>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto py-4">
                <div className="flex gap-2 mb-6">
                  {selectedGuide.steps?.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentStep(idx)}
                      className={`flex-1 h-2 rounded-full transition-all ${
                        idx === currentStep 
                          ? 'bg-primary' 
                          : idx < currentStep 
                            ? 'bg-primary/50' 
                            : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>

                {selectedGuide.steps && selectedGuide.steps[currentStep] && (
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div>
                      <h3 className="text-xl font-bold mb-2">
                        Step {selectedGuide.steps[currentStep].stepNumber}: {selectedGuide.steps[currentStep].title}
                      </h3>
                      <p className="text-muted-foreground text-lg leading-relaxed">
                        {selectedGuide.steps[currentStep].description}
                      </p>
                    </div>

                    {selectedGuide.steps[currentStep].proTips && selectedGuide.steps[currentStep].proTips!.length > 0 && (
                      <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                        <div className="flex items-center gap-2 mb-2">
                          <Lightbulb className="w-4 h-4 text-green-400" />
                          <span className="font-tech text-sm uppercase text-green-400">Pro Tips</span>
                        </div>
                        <ul className="space-y-1">
                          {selectedGuide.steps[currentStep].proTips!.map((tip, i) => (
                            <li key={i} className="text-sm text-green-200 flex items-start gap-2">
                              <CheckCircle2 className="w-3 h-3 mt-1 flex-shrink-0" />
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {selectedGuide.steps[currentStep].warnings && selectedGuide.steps[currentStep].warnings!.length > 0 && (
                      <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="w-4 h-4 text-red-400" />
                          <span className="font-tech text-sm uppercase text-red-400">Warnings</span>
                        </div>
                        <ul className="space-y-1">
                          {selectedGuide.steps[currentStep].warnings!.map((warning, i) => (
                            <li key={i} className="text-sm text-red-200 flex items-start gap-2">
                              <AlertTriangle className="w-3 h-3 mt-1 flex-shrink-0" />
                              {warning}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className="gap-2"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </Button>

                <div className="text-center">
                  <span className="text-sm text-muted-foreground">
                    {currentStep + 1} / {selectedGuide.steps?.length || 0}
                  </span>
                </div>

                <Button
                  onClick={nextStep}
                  disabled={currentStep >= (selectedGuide.steps?.length || 1) - 1}
                  className="gap-2"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              <div className="pt-4 border-t border-border mt-2">
                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {selectedGuide.estimatedTimeMinutes} min
                  </div>
                  <div className="flex items-center gap-1">
                    <Wrench className="w-3 h-3" />
                    Parts: ${selectedGuide.partsCost}
                  </div>
                  {selectedGuide.toolsRequired && (
                    <div className="flex-1">
                      <span className="text-muted-foreground">Tools: </span>
                      <span className="text-foreground">{selectedGuide.toolsRequired.slice(0, 3).join(', ')}
                        {selectedGuide.toolsRequired.length > 3 && ` +${selectedGuide.toolsRequired.length - 3} more`}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      <Footer />
    </div>
  );
}
