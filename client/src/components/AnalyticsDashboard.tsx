import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { 
  Users, Eye, Clock, MousePointer, TrendingUp, Globe, Monitor, 
  Smartphone, Chrome, Loader2, Plus, Trash2, Edit2, Save, X,
  ChevronLeft, ChevronRight, BarChart3, PieChart, Activity,
  Search, FileText, Settings
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  LineChart, Line, BarChart, Bar, PieChart as RechartsPie, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

interface SeoPage {
  id: string;
  route: string;
  title?: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  canonicalUrl?: string;
  robots?: string;
  isActive: boolean;
}

interface AnalyticsSummary {
  totalPageViews: number;
  uniqueVisitors: number;
  totalSessions: number;
  avgSessionDuration: number;
  bounceRate: number;
}

const CHART_COLORS = ['#00d4ff', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#6366f1'];

export default function AnalyticsDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dateRange, setDateRange] = useState("30");
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [seoDialogOpen, setSeoDialogOpen] = useState(false);
  const [editingSeo, setEditingSeo] = useState<SeoPage | null>(null);
  const [newSeoPage, setNewSeoPage] = useState({
    route: "",
    title: "",
    description: "",
    keywords: "",
    ogTitle: "",
    ogDescription: "",
    twitterTitle: "",
    twitterDescription: "",
    robots: "index, follow"
  });

  const days = parseInt(dateRange);

  const { data: summary, isLoading: summaryLoading } = useQuery<AnalyticsSummary>({
    queryKey: ["/api/analytics/summary", days],
    queryFn: async () => {
      const res = await fetch(`/api/analytics/summary?days=${days}`);
      if (!res.ok) throw new Error("Failed to fetch analytics summary");
      return res.json();
    },
  });

  const { data: realtime } = useQuery<{ activeVisitors: number }>({
    queryKey: ["/api/analytics/realtime"],
    refetchInterval: 10000,
  });

  const { data: traffic = [] } = useQuery<{ date: string; pageViews: number; visitors: number }[]>({
    queryKey: ["/api/analytics/traffic", days],
    queryFn: async () => {
      const res = await fetch(`/api/analytics/traffic?days=${days}`);
      if (!res.ok) throw new Error("Failed to fetch traffic");
      return res.json();
    },
  });

  const { data: topPages = [] } = useQuery<{ route: string; views: number }[]>({
    queryKey: ["/api/analytics/pages"],
  });

  const { data: referrers = [] } = useQuery<{ referrer: string; count: number }[]>({
    queryKey: ["/api/analytics/referrers"],
  });

  const { data: devices = [] } = useQuery<{ device: string; count: number }[]>({
    queryKey: ["/api/analytics/devices"],
  });

  const { data: browsers = [] } = useQuery<{ browser: string; count: number }[]>({
    queryKey: ["/api/analytics/browsers"],
  });

  const { data: geo = [] } = useQuery<{ country: string; count: number }[]>({
    queryKey: ["/api/analytics/geo"],
  });

  const { data: seoPages = [], isLoading: seoLoading } = useQuery<SeoPage[]>({
    queryKey: ["/api/seo/pages"],
  });

  const createSeoMutation = useMutation({
    mutationFn: async (data: typeof newSeoPage) => {
      const res = await fetch("/api/seo/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create SEO page");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/seo/pages"] });
      setSeoDialogOpen(false);
      setNewSeoPage({ route: "", title: "", description: "", keywords: "", ogTitle: "", ogDescription: "", twitterTitle: "", twitterDescription: "", robots: "index, follow" });
      toast({ title: "SEO settings created!" });
    },
    onError: (err: Error) => {
      toast({ title: err.message, variant: "destructive" });
    },
  });

  const updateSeoMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<SeoPage> }) => {
      const res = await fetch(`/api/seo/pages/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update SEO page");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/seo/pages"] });
      setEditingSeo(null);
      toast({ title: "SEO settings updated!" });
    },
    onError: () => {
      toast({ title: "Failed to update SEO settings", variant: "destructive" });
    },
  });

  const deleteSeoMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/seo/pages/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete SEO page");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/seo/pages"] });
      toast({ title: "SEO settings deleted!" });
    },
    onError: () => {
      toast({ title: "Failed to delete SEO settings", variant: "destructive" });
    },
  });

  const carouselItems = [
    { title: "Traffic Overview", component: "traffic" },
    { title: "Top Pages", component: "pages" },
    { title: "Device Breakdown", component: "devices" },
  ];

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  if (summaryLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold font-tech">Analytics Dashboard</h2>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-32" data-testid="select-date-range">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="glass-dark border-green-500/30 p-4 text-center">
            <Activity className="w-5 h-5 mx-auto mb-2 text-green-400" />
            <p className="text-2xl font-bold text-green-400">{realtime?.activeVisitors || 0}</p>
            <p className="text-xs text-muted-foreground">Active Now</p>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card className="glass-dark border-primary/30 p-4 text-center">
            <Eye className="w-5 h-5 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{summary?.totalPageViews?.toLocaleString() || 0}</p>
            <p className="text-xs text-muted-foreground">Page Views</p>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="glass-dark border-purple-500/30 p-4 text-center">
            <Users className="w-5 h-5 mx-auto mb-2 text-purple-400" />
            <p className="text-2xl font-bold">{summary?.uniqueVisitors?.toLocaleString() || 0}</p>
            <p className="text-xs text-muted-foreground">Unique Visitors</p>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="glass-dark border-cyan-500/30 p-4 text-center">
            <MousePointer className="w-5 h-5 mx-auto mb-2 text-cyan-400" />
            <p className="text-2xl font-bold">{summary?.totalSessions?.toLocaleString() || 0}</p>
            <p className="text-xs text-muted-foreground">Sessions</p>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="glass-dark border-orange-500/30 p-4 text-center">
            <Clock className="w-5 h-5 mx-auto mb-2 text-orange-400" />
            <p className="text-2xl font-bold">{formatDuration(summary?.avgSessionDuration || 0)}</p>
            <p className="text-xs text-muted-foreground">Avg. Duration</p>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card className="glass-dark border-red-500/30 p-4 text-center">
            <TrendingUp className="w-5 h-5 mx-auto mb-2 text-red-400" />
            <p className="text-2xl font-bold">{summary?.bounceRate || 0}%</p>
            <p className="text-xs text-muted-foreground">Bounce Rate</p>
          </Card>
        </motion.div>
      </div>

      <div className="relative">
        <Card className="glass-dark border-primary/20 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              {carouselItems[carouselIndex].title}
            </h3>
            <div className="flex items-center gap-2">
              {carouselItems.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCarouselIndex(i)}
                  className={`w-2 h-2 rounded-full transition-colors ${i === carouselIndex ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                />
              ))}
              <Button variant="ghost" size="icon" className="ml-2" onClick={() => setCarouselIndex((carouselIndex - 1 + carouselItems.length) % carouselItems.length)}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setCarouselIndex((carouselIndex + 1) % carouselItems.length)}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="h-64">
            {carouselIndex === 0 && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={traffic}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 10 }} />
                  <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--primary)/0.3)' }} />
                  <Legend />
                  <Line type="monotone" dataKey="pageViews" stroke="#00d4ff" strokeWidth={2} dot={false} name="Page Views" />
                  <Line type="monotone" dataKey="visitors" stroke="#8b5cf6" strokeWidth={2} dot={false} name="Visitors" />
                </LineChart>
              </ResponsiveContainer>
            )}

            {carouselIndex === 1 && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topPages.slice(0, 8)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 10 }} />
                  <YAxis dataKey="route" type="category" width={100} stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--primary)/0.3)' }} />
                  <Bar dataKey="views" fill="#00d4ff" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}

            {carouselIndex === 2 && (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie data={devices} dataKey="count" nameKey="device" cx="50%" cy="50%" outerRadius={80} label>
                    {devices.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--primary)/0.3)' }} />
                  <Legend />
                </RechartsPie>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>

      <Accordion type="multiple" defaultValue={["referrers", "seo"]} className="space-y-2">
        <AccordionItem value="referrers" className="border-primary/20">
          <AccordionTrigger className="hover:no-underline px-4 py-3 bg-card/30 rounded-t-lg">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <span>Top Referrers</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 py-3 bg-card/10 rounded-b-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {referrers.length === 0 ? (
                <p className="text-muted-foreground text-sm">No referrer data yet</p>
              ) : (
                referrers.map((r, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-card/30 rounded-lg">
                    <span className="text-sm truncate max-w-[200px]">{r.referrer || "Direct"}</span>
                    <Badge variant="outline">{r.count}</Badge>
                  </div>
                ))
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="browsers" className="border-primary/20">
          <AccordionTrigger className="hover:no-underline px-4 py-3 bg-card/30 rounded-t-lg">
            <div className="flex items-center gap-2">
              <Chrome className="w-4 h-4" />
              <span>Browser Breakdown</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 py-3 bg-card/10 rounded-b-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {browsers.length === 0 ? (
                <p className="text-muted-foreground text-sm">No browser data yet</p>
              ) : (
                browsers.map((b, i) => (
                  <Card key={i} className="p-3 text-center bg-card/30">
                    <p className="font-medium">{b.browser}</p>
                    <p className="text-lg font-bold text-primary">{b.count}</p>
                  </Card>
                ))
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="geo" className="border-primary/20">
          <AccordionTrigger className="hover:no-underline px-4 py-3 bg-card/30 rounded-t-lg">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <span>Geographic Distribution</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 py-3 bg-card/10 rounded-b-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {geo.length === 0 ? (
                <p className="text-muted-foreground text-sm">No geographic data yet</p>
              ) : (
                geo.map((g, i) => (
                  <Card key={i} className="p-3 text-center bg-card/30">
                    <p className="font-medium">{g.country}</p>
                    <p className="text-lg font-bold text-primary">{g.count}</p>
                  </Card>
                ))
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="seo" className="border-primary/20">
          <AccordionTrigger className="hover:no-underline px-4 py-3 bg-card/30 rounded-t-lg">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              <span>SEO Management</span>
              <Badge variant="outline" className="ml-2">{seoPages.length} pages</Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 py-3 bg-card/10 rounded-b-lg">
            <div className="space-y-4">
              <div className="flex justify-end">
                <Dialog open={seoDialogOpen} onOpenChange={setSeoDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" data-testid="button-add-seo">
                      <Plus className="w-4 h-4 mr-2" />
                      Add SEO Settings
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="glass-dark border-primary/30 max-w-2xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="font-tech">Add SEO Settings</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Route *</Label>
                          <Input
                            value={newSeoPage.route}
                            onChange={(e) => setNewSeoPage({ ...newSeoPage, route: e.target.value })}
                            placeholder="/about"
                            data-testid="input-seo-route"
                          />
                        </div>
                        <div>
                          <Label>Robots</Label>
                          <Select value={newSeoPage.robots} onValueChange={(v) => setNewSeoPage({ ...newSeoPage, robots: v })}>
                            <SelectTrigger data-testid="select-seo-robots">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="index, follow">Index, Follow</SelectItem>
                              <SelectItem value="noindex, follow">No Index, Follow</SelectItem>
                              <SelectItem value="index, nofollow">Index, No Follow</SelectItem>
                              <SelectItem value="noindex, nofollow">No Index, No Follow</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label>Page Title</Label>
                        <Input
                          value={newSeoPage.title}
                          onChange={(e) => setNewSeoPage({ ...newSeoPage, title: e.target.value })}
                          placeholder="My Page Title"
                          data-testid="input-seo-title"
                        />
                      </div>
                      <div>
                        <Label>Meta Description</Label>
                        <Textarea
                          value={newSeoPage.description}
                          onChange={(e) => setNewSeoPage({ ...newSeoPage, description: e.target.value })}
                          placeholder="A brief description of this page..."
                          data-testid="input-seo-description"
                        />
                      </div>
                      <div>
                        <Label>Keywords</Label>
                        <Input
                          value={newSeoPage.keywords}
                          onChange={(e) => setNewSeoPage({ ...newSeoPage, keywords: e.target.value })}
                          placeholder="keyword1, keyword2, keyword3"
                          data-testid="input-seo-keywords"
                        />
                      </div>
                      <div className="border-t border-primary/20 pt-4">
                        <p className="text-sm font-medium mb-3">Open Graph (Facebook/LinkedIn)</p>
                        <div className="grid gap-3">
                          <div>
                            <Label>OG Title</Label>
                            <Input
                              value={newSeoPage.ogTitle}
                              onChange={(e) => setNewSeoPage({ ...newSeoPage, ogTitle: e.target.value })}
                              placeholder="Open Graph Title"
                            />
                          </div>
                          <div>
                            <Label>OG Description</Label>
                            <Textarea
                              value={newSeoPage.ogDescription}
                              onChange={(e) => setNewSeoPage({ ...newSeoPage, ogDescription: e.target.value })}
                              placeholder="Open Graph Description"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="border-t border-primary/20 pt-4">
                        <p className="text-sm font-medium mb-3">Twitter Card</p>
                        <div className="grid gap-3">
                          <div>
                            <Label>Twitter Title</Label>
                            <Input
                              value={newSeoPage.twitterTitle}
                              onChange={(e) => setNewSeoPage({ ...newSeoPage, twitterTitle: e.target.value })}
                              placeholder="Twitter Card Title"
                            />
                          </div>
                          <div>
                            <Label>Twitter Description</Label>
                            <Textarea
                              value={newSeoPage.twitterDescription}
                              onChange={(e) => setNewSeoPage({ ...newSeoPage, twitterDescription: e.target.value })}
                              placeholder="Twitter Card Description"
                            />
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() => createSeoMutation.mutate(newSeoPage)}
                        disabled={!newSeoPage.route || createSeoMutation.isPending}
                        className="w-full"
                        data-testid="button-submit-seo"
                      >
                        {createSeoMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                        Create SEO Settings
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {seoLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : seoPages.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No SEO settings configured</p>
                  <p className="text-sm text-muted-foreground">Add SEO meta tags for your pages</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {seoPages.map((page) => (
                    <Card key={page.id} className="p-4 bg-card/30">
                      {editingSeo?.id === page.id ? (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label>Title</Label>
                              <Input
                                value={editingSeo.title || ""}
                                onChange={(e) => setEditingSeo({ ...editingSeo, title: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label>Robots</Label>
                              <Select value={editingSeo.robots || "index, follow"} onValueChange={(v) => setEditingSeo({ ...editingSeo, robots: v })}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="index, follow">Index, Follow</SelectItem>
                                  <SelectItem value="noindex, follow">No Index, Follow</SelectItem>
                                  <SelectItem value="index, nofollow">Index, No Follow</SelectItem>
                                  <SelectItem value="noindex, nofollow">No Index, No Follow</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div>
                            <Label>Description</Label>
                            <Textarea
                              value={editingSeo.description || ""}
                              onChange={(e) => setEditingSeo({ ...editingSeo, description: e.target.value })}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => updateSeoMutation.mutate({ id: page.id, data: editingSeo })}>
                              <Save className="w-3 h-3 mr-1" /> Save
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setEditingSeo(null)}>
                              <X className="w-3 h-3 mr-1" /> Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <code className="text-sm text-primary bg-primary/10 px-2 py-0.5 rounded">{page.route}</code>
                              <Badge variant={page.isActive ? "default" : "secondary"} className="text-xs">
                                {page.robots || "index, follow"}
                              </Badge>
                            </div>
                            {page.title && <p className="font-medium">{page.title}</p>}
                            {page.description && <p className="text-sm text-muted-foreground line-clamp-2">{page.description}</p>}
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <Button size="icon" variant="ghost" onClick={() => setEditingSeo(page)}>
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => deleteSeoMutation.mutate(page.id)}>
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
