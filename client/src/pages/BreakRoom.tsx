import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { AdSenseHorizontal } from "@/components/AdSense";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Coffee, Newspaper, Wrench, Users, Briefcase, Camera, Gauge, AlertTriangle,
  Calendar, MapPin, Fuel, Store, Car, ChevronRight, ChevronLeft, ExternalLink,
  Upload, FileText, Clock, DollarSign, MapPinned, Phone, Mail, User,
  MessageSquare, Star, ArrowRight, Search, X, CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const TABS = [
  { id: "news", label: "News", icon: Newspaper },
  { id: "tools", label: "Tools", icon: Wrench },
  { id: "community", label: "Community", icon: Users },
  { id: "opportunities", label: "Opportunities", icon: Briefcase },
] as const;

type TabId = typeof TABS[number]["id"];

const NEWS_CATEGORIES = [
  "All", "NASCAR", "Formula 1", "MotoGP", "Off-Road", "Trucking",
  "Marine", "Classic Cars", "EV/Electric", "Aviation", "General"
];

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY"
];

function NewsTab() {
  const [activeCategory, setActiveCategory] = useState("All");
  const scrollRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const categoryParam = activeCategory === "All" ? "" : activeCategory;
  const { data: articles, isLoading } = useQuery<any[]>({
    queryKey: ["/api/break-room/news", categoryParam],
    queryFn: async () => {
      const url = categoryParam
        ? `/api/break-room/news?category=${encodeURIComponent(categoryParam)}`
        : "/api/break-room/news";
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    staleTime: 1000 * 60 * 5,
  });

  const scroll = (key: string, dir: "left" | "right") => {
    const el = scrollRefs.current[key];
    if (el) el.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" });
  };

  const grouped: Record<string, any[]> = {};
  if (articles?.length) {
    articles.forEach((a: any) => {
      const cat = a.category || "General";
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(a);
    });
  }

  const carouselKeys = Object.keys(grouped);

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-8">
        {NEWS_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
              activeCategory === cat
                ? "bg-primary/20 border-primary/50 text-primary shadow-[0_0_12px_rgba(6,182,212,0.2)]"
                : "bg-white/5 border-white/10 text-zinc-400 hover:border-primary/30 hover:text-zinc-200"
            }`}
            data-testid={`filter-news-${cat.toLowerCase().replace(/[\s/]/g, "-")}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <div key={i} className="space-y-3">
              <div className="h-5 w-32 bg-white/5 rounded animate-pulse" />
              <div className="flex gap-4 overflow-hidden">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="min-w-[280px] h-[220px] bg-white/5 rounded-xl animate-pulse" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : carouselKeys.length === 0 ? (
        <div className="text-center py-16">
          <Newspaper className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <p className="text-zinc-500">No articles found. Check back soon!</p>
        </div>
      ) : (
        <div className="space-y-8">
          {carouselKeys.map((catKey) => (
            <div key={catKey}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-white">{catKey}</h3>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="w-7 h-7 text-zinc-500 hover:text-white" onClick={() => scroll(catKey, "left")} data-testid={`scroll-left-${catKey}`}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="w-7 h-7 text-zinc-500 hover:text-white" onClick={() => scroll(catKey, "right")} data-testid={`scroll-right-${catKey}`}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div
                ref={(el) => { scrollRefs.current[catKey] = el; }}
                className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 scrollbar-hide"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {grouped[catKey].map((article: any, idx: number) => (
                  <motion.div
                    key={article.id || idx}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="snap-start"
                  >
                    <Card className="min-w-[280px] max-w-[300px] glass-card card-3d hover:border-primary/30 transition-all overflow-hidden group">
                      <div className="aspect-video bg-gradient-to-br from-primary/10 to-cyan-500/10 flex items-center justify-center relative">
                        {article.imageUrl ? (
                          <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover" />
                        ) : (
                          <Newspaper className="w-10 h-10 text-primary/30" />
                        )}
                        {article.source && (
                          <Badge className="absolute bottom-2 left-2 bg-black/70 text-primary border-primary/30 text-[10px]">
                            {article.source}
                          </Badge>
                        )}
                      </div>
                      <div className="p-4">
                        <h4 className="text-sm font-bold text-white mb-1 line-clamp-2 group-hover:text-primary transition-colors" data-testid={`news-title-${idx}`}>
                          {article.title}
                        </h4>
                        <p className="text-xs text-zinc-500 line-clamp-2 mb-3">{article.summary}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-zinc-600 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {article.timeAgo || "Recently"}
                          </span>
                          <a
                            href={article.url || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-primary hover:underline flex items-center gap-1"
                            data-testid={`news-read-more-${idx}`}
                          >
                            Read More <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ReceiptScannerTool() {
  const { toast } = useToast();
  const [scanResult, setScanResult] = useState<any>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const scanMutation = useMutation({
    mutationFn: async (base64: string) => {
      const res = await apiRequest("POST", "/api/break-room/scan", { image: base64, documentType: "receipt" });
      return res.json();
    },
    onSuccess: (data) => {
      setScanResult(data);
      toast({ title: "Scan Complete", description: "Document processed successfully." });
    },
    onError: () => {
      toast({ title: "Scan Failed", description: "Could not process the document.", variant: "destructive" });
    },
  });

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      scanMutation.mutate(base64);
    };
    reader.readAsDataURL(file);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div
        className="border-2 border-dashed border-primary/20 hover:border-primary/50 glass-card rounded-xl p-8 text-center cursor-pointer transition-colors"
        onClick={() => fileRef.current?.click()}
        data-testid="receipt-upload-area"
      >
        <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFile} data-testid="receipt-file-input" />
        <Upload className="w-10 h-10 text-zinc-500 mx-auto mb-3" />
        <p className="text-sm text-zinc-400 mb-1">Tap to upload or take a photo</p>
        <p className="text-xs text-zinc-600">Receipts, registration, insurance docs</p>
      </div>
      <Button variant="outline" className="w-full border-primary/30 text-primary hover:bg-primary/10" onClick={() => fileRef.current?.click()} disabled={scanMutation.isPending} data-testid="button-camera-scan">
        <Camera className="w-4 h-4 mr-2" />
        {scanMutation.isPending ? "Processing..." : "Open Camera"}
      </Button>
      {scanResult && (
        <Card className="glass-card border-primary/20 p-4">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium text-white">Extracted Data</span>
          </div>
          <pre className="text-xs text-zinc-300 whitespace-pre-wrap overflow-auto max-h-48" data-testid="scan-results">
            {JSON.stringify(scanResult, null, 2)}
          </pre>
        </Card>
      )}
    </motion.div>
  );
}

function MileageTrackerTool() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ date: "", startOdometer: "", endOdometer: "", purpose: "Business", notes: "" });

  const { data: entries } = useQuery<any[]>({
    queryKey: ["/api/break-room/mileage"],
    queryFn: async () => {
      const res = await fetch("/api/break-room/mileage", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/break-room/mileage", {
        date: form.date,
        startOdometer: Number(form.startOdometer),
        endOdometer: Number(form.endOdometer),
        purpose: form.purpose,
        notes: form.notes,
      });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Entry Added", description: "Mileage entry saved." });
      setForm({ date: "", startOdometer: "", endOdometer: "", purpose: "Business", notes: "" });
      queryClient.invalidateQueries({ queryKey: ["/api/break-room/mileage"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Could not save entry.", variant: "destructive" });
    },
  });

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="bg-black/30 border-white/10 focus:border-primary/50" data-testid="input-mileage-date" />
        <Select value={form.purpose} onValueChange={(v) => setForm({ ...form, purpose: v })}>
          <SelectTrigger className="bg-black/30 border-white/10 focus:border-primary/50" data-testid="select-mileage-purpose"><SelectValue /></SelectTrigger>
          <SelectContent>
            {["Business", "Personal", "Medical", "Moving"].map((p) => (
              <SelectItem key={p} value={p}>{p}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input type="number" placeholder="Start Odometer" value={form.startOdometer} onChange={(e) => setForm({ ...form, startOdometer: e.target.value })} className="bg-black/30 border-white/10 focus:border-primary/50" data-testid="input-start-odometer" />
        <Input type="number" placeholder="End Odometer" value={form.endOdometer} onChange={(e) => setForm({ ...form, endOdometer: e.target.value })} className="bg-black/30 border-white/10 focus:border-primary/50" data-testid="input-end-odometer" />
      </div>
      <Input placeholder="Notes (optional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="bg-black/30 border-white/10 focus:border-primary/50" data-testid="input-mileage-notes" />
      <Button className="w-full bg-primary hover:bg-primary/80 text-black font-medium" onClick={() => addMutation.mutate()} disabled={addMutation.isPending || !form.date || !form.startOdometer || !form.endOdometer} data-testid="button-add-mileage">
        {addMutation.isPending ? "Saving..." : "Add Entry"}
      </Button>
      {entries && entries.length > 0 && (
        <div className="space-y-2 mt-4">
          <h4 className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Recent Entries</h4>
          {entries.slice(0, 5).map((entry: any, i: number) => (
            <Card key={i} className="glass-card p-3 flex items-center justify-between">
              <div>
                <span className="text-sm text-white">{entry.date}</span>
                <span className="text-xs text-zinc-500 ml-2">{entry.purpose}</span>
              </div>
              <Badge className="bg-primary/10 text-primary border-primary/30">{(entry.endOdometer - entry.startOdometer).toLocaleString()} mi</Badge>
            </Card>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function RecallCheckerTool() {
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [searched, setSearched] = useState(false);

  const { data: recalls, isLoading, refetch } = useQuery<any[]>({
    queryKey: ["/api/break-room/recalls", make, model, year],
    queryFn: async () => {
      const res = await fetch(`/api/break-room/recalls?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&year=${encodeURIComponent(year)}`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: false,
  });

  const handleCheck = () => {
    setSearched(true);
    refetch();
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 40 }, (_, i) => String(currentYear - i));

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Input placeholder="Make (e.g. Toyota)" value={make} onChange={(e) => setMake(e.target.value)} className="bg-black/30 border-white/10 focus:border-primary/50" data-testid="input-recall-make" />
        <Input placeholder="Model (e.g. Camry)" value={model} onChange={(e) => setModel(e.target.value)} className="bg-black/30 border-white/10 focus:border-primary/50" data-testid="input-recall-model" />
        <Select value={year} onValueChange={setYear}>
          <SelectTrigger className="bg-black/30 border-white/10 focus:border-primary/50" data-testid="select-recall-year"><SelectValue placeholder="Year" /></SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={y}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button className="w-full bg-amber-500 hover:bg-amber-600 text-black font-medium" onClick={handleCheck} disabled={isLoading || !make || !year} data-testid="button-check-recalls">
        <AlertTriangle className="w-4 h-4 mr-2" />
        {isLoading ? "Checking..." : "Check Recalls"}
      </Button>
      {searched && recalls && (
        <div className="space-y-2">
          {recalls.length === 0 ? (
            <Card className="glass-card border-green-500/20 p-4 text-center">
              <CheckCircle className="w-6 h-6 text-green-400 mx-auto mb-2" />
              <p className="text-sm text-green-400">No open recalls found!</p>
            </Card>
          ) : (
            recalls.map((r: any, i: number) => (
              <Card key={i} className="glass-card border-amber-500/20 p-4" data-testid={`recall-result-${i}`}>
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
                  <div>
                    <h5 className="text-sm font-bold text-white mb-1">{r.component || r.title}</h5>
                    <p className="text-xs text-zinc-400 line-clamp-3">{r.summary || r.description}</p>
                    {r.remedy && <p className="text-xs text-zinc-500 mt-1">Remedy: {r.remedy}</p>}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </motion.div>
  );
}

function ToolsTab() {
  const [activeTool, setActiveTool] = useState<string | null>(null);

  const tools = [
    { id: "scanner", label: "Receipt Scanner", icon: Camera, description: "Snap & scan receipts, registration, insurance docs", buttonText: "Open Scanner" },
    { id: "mileage", label: "Mileage Tracker", icon: Gauge, description: "Track business miles for tax deductions", buttonText: "Track Miles" },
    { id: "recalls", label: "Recall Checker", icon: AlertTriangle, description: "Check your vehicle for open recalls via NHTSA", buttonText: "Check Recalls" },
    { id: "maintenance", label: "Maintenance Scheduler", icon: Calendar, description: "Never miss an oil change or tire rotation", buttonText: "Open Scheduler", link: "/garage" },
  ];

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {tools.map((tool, i) => (
          <motion.div key={tool.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card
              className={`glass-card card-3d p-5 hover:border-primary/30 transition-all cursor-pointer ${activeTool === tool.id ? "border-primary/50 shadow-[0_0_20px_rgba(6,182,212,0.1)]" : ""}`}
              onClick={() => tool.link ? undefined : setActiveTool(activeTool === tool.id ? null : tool.id)}
              data-testid={`tool-card-${tool.id}`}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <tool.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-white mb-1">{tool.label}</h3>
                  <p className="text-xs text-zinc-500 mb-3">{tool.description}</p>
                  {tool.link ? (
                    <Link href={tool.link}>
                      <Button size="sm" variant="outline" className="border-primary/30 text-primary hover:bg-primary/10" data-testid={`button-${tool.id}`}>
                        {tool.buttonText} <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className={`border-primary/30 text-primary hover:bg-primary/10 ${activeTool === tool.id ? "bg-primary/10" : ""}`}
                      onClick={(e) => { e.stopPropagation(); setActiveTool(activeTool === tool.id ? null : tool.id); }}
                      data-testid={`button-${tool.id}`}
                    >
                      {tool.buttonText}
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTool === "scanner" && (
          <motion.div key="scanner" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
            <Card className="glass-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-primary flex items-center gap-2"><Camera className="w-4 h-4" /> Receipt Scanner</h3>
                <Button variant="ghost" size="icon" className="w-6 h-6" onClick={() => setActiveTool(null)}><X className="w-4 h-4" /></Button>
              </div>
              <ReceiptScannerTool />
            </Card>
          </motion.div>
        )}
        {activeTool === "mileage" && (
          <motion.div key="mileage" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
            <Card className="glass-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-primary flex items-center gap-2"><Gauge className="w-4 h-4" /> Mileage Tracker</h3>
                <Button variant="ghost" size="icon" className="w-6 h-6" onClick={() => setActiveTool(null)}><X className="w-4 h-4" /></Button>
              </div>
              <MileageTrackerTool />
            </Card>
          </motion.div>
        )}
        {activeTool === "recalls" && (
          <motion.div key="recalls" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
            <Card className="glass-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-primary flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Recall Checker</h3>
                <Button variant="ghost" size="icon" className="w-6 h-6" onClick={() => setActiveTool(null)}><X className="w-4 h-4" /></Button>
              </div>
              <RecallCheckerTool />
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CommunityTab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [speedTrapState, setSpeedTrapState] = useState("");
  const [speedTrapForm, setSpeedTrapForm] = useState({ description: "", city: "", state: "" });
  const [fuelZip, setFuelZip] = useState("");
  const [fuelForm, setFuelForm] = useState({ stationName: "", brand: "", regularPrice: "", dieselPrice: "", zipCode: "" });
  const [shopState, setShopState] = useState("");
  const [eventState, setEventState] = useState("");

  const { data: speedTraps } = useQuery<any[]>({
    queryKey: ["/api/break-room/speed-traps", speedTrapState],
    queryFn: async () => {
      if (!speedTrapState) return [];
      const res = await fetch(`/api/break-room/speed-traps?state=${speedTrapState}`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!speedTrapState && expandedSection === "speed-traps",
  });

  const speedTrapMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/break-room/speed-traps", speedTrapForm);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Report Submitted", description: "Speed trap reported. Thanks!" });
      setSpeedTrapForm({ description: "", city: "", state: "" });
      queryClient.invalidateQueries({ queryKey: ["/api/break-room/speed-traps"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Could not submit report.", variant: "destructive" });
    },
  });

  const { data: fuelPrices } = useQuery<any[]>({
    queryKey: ["/api/break-room/fuel", fuelZip],
    queryFn: async () => {
      if (!fuelZip || fuelZip.length < 5) return [];
      const res = await fetch(`/api/break-room/fuel?zip=${fuelZip}`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: fuelZip.length >= 5 && expandedSection === "fuel",
  });

  const fuelMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/break-room/fuel", {
        ...fuelForm,
        regularPrice: Number(fuelForm.regularPrice),
        dieselPrice: Number(fuelForm.dieselPrice),
      });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Price Reported", description: "Fuel price submitted." });
      setFuelForm({ stationName: "", brand: "", regularPrice: "", dieselPrice: "", zipCode: "" });
      queryClient.invalidateQueries({ queryKey: ["/api/break-room/fuel"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Could not submit price.", variant: "destructive" });
    },
  });

  const { data: shops } = useQuery<any[]>({
    queryKey: ["/api/break-room/specialty-shops", shopState],
    queryFn: async () => {
      if (!shopState) return [];
      const res = await fetch(`/api/break-room/specialty-shops?state=${shopState}`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!shopState && expandedSection === "shops",
  });

  const { data: events } = useQuery<any[]>({
    queryKey: ["/api/break-room/events", eventState],
    queryFn: async () => {
      if (!eventState) return [];
      const res = await fetch(`/api/break-room/events?state=${eventState}`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!eventState && expandedSection === "events",
  });

  const sections = [
    { id: "speed-traps", label: "Speed Trap Alerts", icon: MapPin, description: "Report and view speed traps near you", color: "text-red-400 bg-red-500/10 border-red-500/20" },
    { id: "fuel", label: "Fuel Prices", icon: Fuel, description: "Report and compare gas prices", color: "text-green-400 bg-green-500/10 border-green-500/20" },
    { id: "shops", label: "Specialty Shops", icon: Store, description: "Find salvage yards & restoration shops", color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
    { id: "events", label: "Car Shows & Events", icon: Calendar, description: "Find local car shows & meetups", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  ];

  return (
    <div className="space-y-4">
      {sections.map((section, i) => (
        <motion.div key={section.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
          <Card
            className={`glass-card overflow-hidden transition-all ${expandedSection === section.id ? "border-primary/30" : "hover:border-zinc-700"}`}
            data-testid={`community-card-${section.id}`}
          >
            <div
              className="p-5 cursor-pointer flex items-center gap-4"
              onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
            >
              <div className={`w-11 h-11 rounded-xl ${section.color} border flex items-center justify-center shrink-0`}>
                <section.icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-white">{section.label}</h3>
                <p className="text-xs text-zinc-500">{section.description}</p>
              </div>
              <ChevronRight className={`w-5 h-5 text-zinc-600 transition-transform ${expandedSection === section.id ? "rotate-90" : ""}`} />
            </div>

            <AnimatePresence>
              {expandedSection === section.id && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="px-5 pb-5 border-t border-zinc-800 pt-4 space-y-3">
                    {section.id === "speed-traps" && (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <Input placeholder="Description" value={speedTrapForm.description} onChange={(e) => setSpeedTrapForm({ ...speedTrapForm, description: e.target.value })} className="bg-black/30 border-white/10 focus:border-primary/50" data-testid="input-speed-trap-desc" />
                          <Input placeholder="City" value={speedTrapForm.city} onChange={(e) => setSpeedTrapForm({ ...speedTrapForm, city: e.target.value })} className="bg-black/30 border-white/10 focus:border-primary/50" data-testid="input-speed-trap-city" />
                          <Select value={speedTrapForm.state} onValueChange={(v) => setSpeedTrapForm({ ...speedTrapForm, state: v })}>
                            <SelectTrigger className="bg-black/30 border-white/10 focus:border-primary/50" data-testid="select-speed-trap-state"><SelectValue placeholder="State" /></SelectTrigger>
                            <SelectContent>{US_STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                        <Button size="sm" className="bg-red-500 hover:bg-red-600 text-white" onClick={() => speedTrapMutation.mutate()} disabled={speedTrapMutation.isPending || !speedTrapForm.description || !speedTrapForm.state} data-testid="button-report-speed-trap">
                          <MapPin className="w-3 h-3 mr-1" /> Report
                        </Button>
                        <div className="flex gap-2 items-center mt-2">
                          <Select value={speedTrapState} onValueChange={setSpeedTrapState}>
                            <SelectTrigger className="bg-black/30 border-white/10 focus:border-primary/50 w-24" data-testid="select-view-speed-trap-state"><SelectValue placeholder="State" /></SelectTrigger>
                            <SelectContent>{US_STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                          </Select>
                          <span className="text-xs text-zinc-500">Browse reports</span>
                        </div>
                        {speedTraps && speedTraps.length > 0 && (
                          <div className="space-y-2">
                            {speedTraps.slice(0, 5).map((t: any, i: number) => (
                              <div key={i} className="flex items-center gap-2 text-xs text-zinc-400 glass-card rounded p-2">
                                <MapPin className="w-3 h-3 text-red-400 shrink-0" />
                                <span className="text-white">{t.city}, {t.state}</span> - {t.description}
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}

                    {section.id === "fuel" && (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <Input placeholder="Station Name" value={fuelForm.stationName} onChange={(e) => setFuelForm({ ...fuelForm, stationName: e.target.value })} className="bg-black/30 border-white/10 focus:border-primary/50" data-testid="input-fuel-station" />
                          <Input placeholder="Brand" value={fuelForm.brand} onChange={(e) => setFuelForm({ ...fuelForm, brand: e.target.value })} className="bg-black/30 border-white/10 focus:border-primary/50" data-testid="input-fuel-brand" />
                          <Input type="number" step="0.01" placeholder="Regular $/gal" value={fuelForm.regularPrice} onChange={(e) => setFuelForm({ ...fuelForm, regularPrice: e.target.value })} className="bg-black/30 border-white/10 focus:border-primary/50" data-testid="input-fuel-regular" />
                          <Input type="number" step="0.01" placeholder="Diesel $/gal" value={fuelForm.dieselPrice} onChange={(e) => setFuelForm({ ...fuelForm, dieselPrice: e.target.value })} className="bg-black/30 border-white/10 focus:border-primary/50" data-testid="input-fuel-diesel" />
                        </div>
                        <Input placeholder="Zip Code" value={fuelForm.zipCode} onChange={(e) => setFuelForm({ ...fuelForm, zipCode: e.target.value })} className="bg-black/30 border-white/10 focus:border-primary/50 w-32" data-testid="input-fuel-zip" />
                        <Button size="sm" className="bg-green-500 hover:bg-green-600 text-black" onClick={() => fuelMutation.mutate()} disabled={fuelMutation.isPending || !fuelForm.stationName || !fuelForm.zipCode} data-testid="button-report-fuel">
                          <Fuel className="w-3 h-3 mr-1" /> Report Price
                        </Button>
                        <div className="flex gap-2 items-center mt-2">
                          <Input placeholder="Search by ZIP" value={fuelZip} onChange={(e) => setFuelZip(e.target.value)} className="bg-black/30 border-white/10 focus:border-primary/50 w-32" data-testid="input-fuel-search-zip" />
                          <span className="text-xs text-zinc-500">Browse prices</span>
                        </div>
                        {fuelPrices && fuelPrices.length > 0 && (
                          <div className="space-y-2">
                            {fuelPrices.slice(0, 5).map((f: any, i: number) => (
                              <div key={i} className="flex items-center justify-between text-xs glass-card rounded p-2">
                                <div className="text-white">{f.stationName} <span className="text-zinc-500">({f.brand})</span></div>
                                <div className="flex gap-3">
                                  {f.regularPrice && <span className="text-green-400">${f.regularPrice} reg</span>}
                                  {f.dieselPrice && <span className="text-amber-400">${f.dieselPrice} diesel</span>}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}

                    {section.id === "shops" && (
                      <>
                        <Select value={shopState} onValueChange={setShopState}>
                          <SelectTrigger className="bg-black/30 border-white/10 focus:border-primary/50 w-32" data-testid="select-shop-state"><SelectValue placeholder="State" /></SelectTrigger>
                          <SelectContent>{US_STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                        </Select>
                        {shops && shops.length > 0 ? (
                          <div className="space-y-2">
                            {shops.map((s: any, i: number) => (
                              <Card key={i} className="glass-card p-3" data-testid={`shop-card-${i}`}>
                                <h5 className="text-sm font-bold text-white">{s.name}</h5>
                                <p className="text-xs text-zinc-500">{s.address || s.city}</p>
                                {s.specialty && <Badge className="mt-1 bg-purple-500/10 text-purple-400 border-purple-500/30 text-[10px]">{s.specialty}</Badge>}
                              </Card>
                            ))}
                          </div>
                        ) : shopState ? (
                          <p className="text-xs text-zinc-500">No shops found in {shopState}.</p>
                        ) : null}
                      </>
                    )}

                    {section.id === "events" && (
                      <>
                        <Select value={eventState} onValueChange={setEventState}>
                          <SelectTrigger className="bg-black/30 border-white/10 focus:border-primary/50 w-32" data-testid="select-event-state"><SelectValue placeholder="State" /></SelectTrigger>
                          <SelectContent>{US_STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                        </Select>
                        {events && events.length > 0 ? (
                          <div className="space-y-2">
                            {events.map((ev: any, i: number) => (
                              <Card key={i} className="glass-card p-3" data-testid={`event-card-${i}`}>
                                <h5 className="text-sm font-bold text-white">{ev.name || ev.title}</h5>
                                <p className="text-xs text-zinc-500">{ev.date} {ev.location && `- ${ev.location}`}</p>
                                {ev.type && <Badge className="mt-1 bg-amber-500/10 text-amber-400 border-amber-500/30 text-[10px]">{ev.type}</Badge>}
                              </Card>
                            ))}
                          </div>
                        ) : eventState ? (
                          <p className="text-xs text-zinc-500">No events found in {eventState}.</p>
                        ) : null}
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

function OpportunitiesTab() {
  const { toast } = useToast();
  const [selectedProgram, setSelectedProgram] = useState<any>(null);
  const [referralForm, setReferralForm] = useState({
    fullName: "", email: "", phone: "", location: "",
    cdlClass: "Class A", experienceLevel: "None", message: "",
  });

  const { data: programs, isLoading } = useQuery<any[]>({
    queryKey: ["/api/break-room/cdl-programs"],
    queryFn: async () => {
      const res = await fetch("/api/break-room/cdl-programs", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const referralMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/break-room/cdl-referrals", {
        ...referralForm,
        programId: selectedProgram?.id,
        programName: selectedProgram?.companyName,
      });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Interest Submitted!", description: "We'll connect you with the recruiter." });
      setSelectedProgram(null);
      setReferralForm({ fullName: "", email: "", phone: "", location: "", cdlClass: "Class A", experienceLevel: "None", message: "" });
    },
    onError: () => {
      toast({ title: "Error", description: "Could not submit. Try again.", variant: "destructive" });
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-bold text-white mb-1">CDL Schools & Trucking</h3>
        <p className="text-sm text-zinc-500 mb-4">Explore paid training programs and trucking careers</p>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : programs && programs.length > 0 ? (
          <div className="space-y-4">
            {programs.map((prog: any, i: number) => (
              <motion.div key={prog.id || i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <Card className="glass-card hover:border-primary/30 transition-all p-5" data-testid={`cdl-program-${i}`}>
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="text-base font-bold text-white">{prog.companyName}</h4>
                        {prog.programType && (
                          <Badge className="bg-primary/10 text-primary border-primary/30 text-[10px]">{prog.programType}</Badge>
                        )}
                      </div>
                      <p className="text-sm text-zinc-400 mb-3">{prog.description}</p>
                      <div className="flex flex-wrap gap-3 text-xs text-zinc-500">
                        {prog.payRange && (
                          <span className="flex items-center gap-1"><DollarSign className="w-3 h-3 text-green-400" />{prog.payRange}</span>
                        )}
                        {prog.location && (
                          <span className="flex items-center gap-1"><MapPinned className="w-3 h-3 text-primary" />{prog.location}</span>
                        )}
                        {prog.benefits && (
                          <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400" />{prog.benefits}</span>
                        )}
                      </div>
                      {prog.referralBonus && (
                        <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 rounded bg-green-500/10 border border-green-500/20 text-green-400 text-[10px]">
                          <DollarSign className="w-3 h-3" /> Referral Bonus: {prog.referralBonus}
                        </div>
                      )}
                    </div>
                    <Button
                      size="sm"
                      className="bg-primary hover:bg-primary/80 text-black font-medium shrink-0"
                      onClick={() => setSelectedProgram(selectedProgram?.id === prog.id ? null : prog)}
                      data-testid={`button-interested-${i}`}
                    >
                      I'm Interested
                    </Button>
                  </div>

                  <AnimatePresence>
                    {selectedProgram?.id === prog.id && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="mt-4 pt-4 border-t border-zinc-800 space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <Input placeholder="Full Name" value={referralForm.fullName} onChange={(e) => setReferralForm({ ...referralForm, fullName: e.target.value })} className="bg-black/30 border-white/10 focus:border-primary/50" data-testid="input-referral-name" />
                            <Input type="email" placeholder="Email" value={referralForm.email} onChange={(e) => setReferralForm({ ...referralForm, email: e.target.value })} className="bg-black/30 border-white/10 focus:border-primary/50" data-testid="input-referral-email" />
                            <Input placeholder="Phone" value={referralForm.phone} onChange={(e) => setReferralForm({ ...referralForm, phone: e.target.value })} className="bg-black/30 border-white/10 focus:border-primary/50" data-testid="input-referral-phone" />
                            <Input placeholder="Your Location" value={referralForm.location} onChange={(e) => setReferralForm({ ...referralForm, location: e.target.value })} className="bg-black/30 border-white/10 focus:border-primary/50" data-testid="input-referral-location" />
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <Select value={referralForm.cdlClass} onValueChange={(v) => setReferralForm({ ...referralForm, cdlClass: v })}>
                              <SelectTrigger className="bg-black/30 border-white/10 focus:border-primary/50" data-testid="select-cdl-class"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {["Class A", "Class B", "Passenger"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                              </SelectContent>
                            </Select>
                            <Select value={referralForm.experienceLevel} onValueChange={(v) => setReferralForm({ ...referralForm, experienceLevel: v })}>
                              <SelectTrigger className="bg-black/30 border-white/10 focus:border-primary/50" data-testid="select-experience"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {["None", "Student", "1-2 Years", "3-5 Years", "5+ Years"].map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>
                          <Input placeholder="Message (optional)" value={referralForm.message} onChange={(e) => setReferralForm({ ...referralForm, message: e.target.value })} className="bg-black/30 border-white/10 focus:border-primary/50" data-testid="input-referral-message" />
                          <Button
                            className="w-full bg-primary hover:bg-primary/80 text-black font-medium"
                            onClick={() => referralMutation.mutate()}
                            disabled={referralMutation.isPending || !referralForm.fullName || !referralForm.email}
                            data-testid="button-submit-referral"
                          >
                            {referralMutation.isPending ? "Submitting..." : "Submit Interest"}
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card className="glass-card p-8 text-center">
            <Briefcase className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
            <p className="text-sm text-zinc-500">No programs available right now. Check back soon!</p>
          </Card>
        )}
      </div>

      <div>
        <h3 className="text-lg font-bold text-white mb-1">Other Opportunities</h3>
        <p className="text-sm text-zinc-500 mb-4">Aviation, aerospace, skilled trades & more</p>
        <Card className="glass-card p-6 text-center border-dashed">
          <Star className="w-8 h-8 text-primary/30 mx-auto mb-2" />
          <p className="text-sm text-zinc-500">More career opportunities coming soon.</p>
          <p className="text-xs text-zinc-600 mt-1">Aviation, aerospace, diesel tech, welding & more</p>
        </Card>
      </div>
    </div>
  );
}

export default function BreakRoom() {
  const [activeTab, setActiveTab] = useState<TabId>("news");

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Nav />
      <div className="pt-[50px]">
      <section className="relative overflow-hidden pt-20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-cyan-500/5" />
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/15 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 glass-ultra rounded-xl text-primary text-sm mb-6"
            >
              <Coffee className="w-4 h-4" />
              Pit Stop Hub
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl font-bold text-white mb-6"
            >
              The Break Room
              <br />
              <span className="bg-gradient-to-r from-primary via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                News, Tools & Community
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-zinc-400 max-w-2xl mx-auto"
              data-testid="text-breakroom-tagline"
            >
              Your pit stop for news, tools & community. Grab a coffee and catch up.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center gap-2 sm:gap-3"
          >
            {TABS.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "outline"}
                size="lg"
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? "glass-card-accent text-black font-bold shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                    : "glass-card text-zinc-400 hover:text-white hover:border-primary/40"
                } transition-all`}
                data-testid={`tab-${tab.id}`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </Button>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              {activeTab === "news" && <NewsTab />}
              {activeTab === "tools" && <ToolsTab />}
              {activeTab === "community" && <CommunityTab />}
              {activeTab === "opportunities" && <OpportunitiesTab />}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>
      </div>
      <div className="max-w-6xl mx-auto px-4 py-4">
        <AdSenseHorizontal className="my-4" />
      </div>
      <Footer />
    </div>
  );
}
