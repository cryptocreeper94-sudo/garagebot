import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Megaphone, Plus, Send, Clock, CheckCircle, XCircle, Image as ImageIcon, 
  Twitter, Facebook, Instagram, RefreshCw, Trash2, Eye, Loader2, Sparkles,
  Calendar, BarChart3, TrendingUp, Target, DollarSign, FileText, Layers,
  ChevronLeft, ChevronRight, Search, Filter, Star, Wand2, Copy, Download,
  Linkedin, MapPin, Building2, MessageSquare, Edit, Home, ExternalLink
} from "lucide-react";
import { format, startOfWeek, addDays, eachDayOfInterval, isSameDay, addWeeks, subWeeks } from "date-fns";

interface MarketingPost {
  id: string;
  content: string;
  platform: string;
  hashtags: string[];
  targetSite: string;
  category: string;
  tone: string;
  cta: string;
  isActive: boolean;
  usageCount: number;
  lastUsedAt: string | null;
  createdAt: string;
}

interface MarketingImage {
  id: string;
  filename: string;
  filePath: string;
  category: string;
  subject: string;
  style: string;
  season: string;
  quality: number;
  altText: string;
  isActive: boolean;
  usageCount: number;
}

interface ContentBundle {
  id: string;
  imageId: string;
  messageId: string;
  imageUrl: string;
  message: string;
  platform: string;
  status: string;
  postType: string;
  targetAudience: string;
  budgetRange: string;
  ctaButton: string;
  scheduledDate: string | null;
  postedAt: string | null;
  impressions: number;
  reach: number;
  clicks: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  leads: number;
  conversions: number;
  spend: number;
  revenue: number;
}

interface PostHistory {
  id: string;
  platform: string;
  content: string;
  status: string;
  externalPostId: string | null;
  error: string | null;
  postedAt: string | null;
  impressions: number;
  reach: number;
  clicks: number;
  likes: number;
  comments: number;
  shares: number;
  createdAt: string;
}

type ImageSubject = "garagebot" | "parts" | "vehicles" | "diy" | "shop" | "comparison" | "retailers" | "trustlayer" | "slogan" | "ai" | "blockchain" | "all-types" | "mechanics" | "darkwave" | "general";
type ImageStyle = "product" | "lifestyle" | "hatch-print" | "before-after" | "action-shot" | "detail-closeup";
type ImageSeason = "spring" | "summer" | "fall" | "winter" | "all-year";
type MessageTone = "professional" | "friendly" | "promotional" | "educational" | "urgent";
type MessageCTA = "book-now" | "get-quote" | "learn-more" | "call-us" | "visit-site" | "shop-now" | "none";
type SocialPlatform = "instagram" | "facebook" | "nextdoor" | "x" | "linkedin" | "google" | "all";

const PLATFORM_CHAR_LIMITS: Record<SocialPlatform, { limit: number; name: string }> = {
  x: { limit: 280, name: 'X (Twitter)' },
  instagram: { limit: 2200, name: 'Instagram' },
  facebook: { limit: 63206, name: 'Facebook' },
  nextdoor: { limit: 2000, name: 'Nextdoor' },
  linkedin: { limit: 3000, name: 'LinkedIn' },
  google: { limit: 1500, name: 'Google Business' },
  all: { limit: 280, name: 'All Platforms' },
};

const IMAGE_SUBJECTS = [
  { id: "garagebot", label: "GarageBot Brand" },
  { id: "parts", label: "Auto Parts" },
  { id: "vehicles", label: "Vehicles" },
  { id: "diy", label: "DIY Repair" },
  { id: "shop", label: "Shop/Professional" },
  { id: "comparison", label: "Price Compare" },
  { id: "retailers", label: "Retailers" },
  { id: "trustlayer", label: "Trust Layer" },
  { id: "slogan", label: "Slogan/Tagline" },
  { id: "ai", label: "AI Features" },
  { id: "blockchain", label: "Blockchain" },
  { id: "mechanics", label: "Mechanics Garage" },
  { id: "darkwave", label: "DarkWave Studios" },
  { id: "general", label: "General" },
];

const IMAGE_STYLES = [
  { id: "product", label: "Product Shot" },
  { id: "lifestyle", label: "Lifestyle" },
  { id: "hatch-print", label: "Hatch Show Print" },
  { id: "before-after", label: "Before/After" },
  { id: "action-shot", label: "Action Shot" },
  { id: "detail-closeup", label: "Detail Close-up" },
];

const IMAGE_SEASONS = [
  { id: "all-year", label: "All Year" },
  { id: "spring", label: "Spring" },
  { id: "summer", label: "Summer" },
  { id: "fall", label: "Fall" },
  { id: "winter", label: "Winter" },
];

const MESSAGE_TONES = [
  { id: "professional", label: "Professional" },
  { id: "friendly", label: "Friendly" },
  { id: "promotional", label: "Promotional" },
  { id: "educational", label: "Educational" },
  { id: "urgent", label: "Urgent" },
];

const MESSAGE_CTAS = [
  { id: "none", label: "No CTA" },
  { id: "shop-now", label: "Shop Now" },
  { id: "learn-more", label: "Learn More" },
  { id: "get-quote", label: "Get Quote" },
  { id: "call-us", label: "Call Us" },
  { id: "visit-site", label: "Visit Site" },
];

const PLATFORMS = [
  { id: "x", label: "X / Twitter", icon: Twitter, color: "bg-blue-400" },
  { id: "facebook", label: "Facebook", icon: Facebook, color: "bg-blue-600" },
  { id: "instagram", label: "Instagram", icon: Instagram, color: "bg-pink-500" },
  { id: "linkedin", label: "LinkedIn", icon: Linkedin, color: "bg-blue-700" },
  { id: "nextdoor", label: "Nextdoor", icon: Home, color: "bg-green-600" },
  { id: "google", label: "Google Business", icon: Building2, color: "bg-red-500" },
];

const ECOSYSTEM_SITES = [
  { value: "garagebot", label: "GarageBot", url: "garagebot.io" },
  { value: "dwtl", label: "DarkWave", url: "dwtl.io" },
  { value: "dwsc", label: "Service Cloud", url: "dwsc.io" },
  { value: "tlid", label: "Trust Layer", url: "tlid.io" },
  { value: "trustshield", label: "TrustShield", url: "trustshield.tech" },
];

const BUDGET_RANGES = [
  { id: "none", label: "Organic Only" },
  { id: "5-25", label: "$5 - $25/day" },
  { id: "25-50", label: "$25 - $50/day" },
  { id: "50-100", label: "$50 - $100/day" },
  { id: "100+", label: "$100+/day" },
];

const TARGET_AUDIENCES = [
  { id: "diy-enthusiasts", label: "DIY Enthusiasts" },
  { id: "professional-mechanics", label: "Professional Mechanics" },
  { id: "fleet-managers", label: "Fleet Managers" },
  { id: "car-enthusiasts", label: "Car Enthusiasts" },
  { id: "shop-owners", label: "Shop Owners" },
  { id: "general-auto", label: "General Auto Owners" },
];

export default function MarketingHub() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Tab and filter state
  const [activeTab, setActiveTab] = useState<"content" | "dam" | "bundles" | "calendar" | "analytics" | "ads">("content");
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [styleFilter, setStyleFilter] = useState<string>("all");
  const [seasonFilter, setSeasonFilter] = useState<string>("all");
  const [qualityFilter, setQualityFilter] = useState<number[]>([1, 5]);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modal state
  const [showNewPost, setShowNewPost] = useState(false);
  const [showBundleModal, setShowBundleModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<MarketingImage | null>(null);
  const [selectedPost, setSelectedPost] = useState<MarketingPost | null>(null);
  
  // Form state
  const [newPost, setNewPost] = useState({ 
    content: "", 
    platform: "all", 
    targetSite: "garagebot", 
    hashtags: "",
    tone: "professional",
    cta: "none",
    category: "general"
  });
  
  const [newBundle, setNewBundle] = useState({
    imageId: "",
    messageId: "",
    platform: "all",
    postType: "organic",
    targetAudience: "",
    budgetRange: "none",
    ctaButton: "none",
    scheduledDate: ""
  });
  
  const [aiPrompt, setAiPrompt] = useState("");
  
  // Calendar state
  const [calendarWeekStart, setCalendarWeekStart] = useState(startOfWeek(new Date()));

  // Queries
  const { data: status } = useQuery({
    queryKey: ["/api/marketing/status"],
    queryFn: () => apiRequest("GET", "/api/marketing/status").then(r => r.json()),
  });

  const { data: posts = [] } = useQuery<MarketingPost[]>({
    queryKey: ["/api/marketing/posts"],
    queryFn: () => apiRequest("GET", "/api/marketing/posts").then(r => r.json()),
  });

  const { data: images = [] } = useQuery<MarketingImage[]>({
    queryKey: ["/api/marketing/images"],
    queryFn: () => apiRequest("GET", "/api/marketing/images").then(r => r.json()),
  });

  const { data: history = [] } = useQuery<PostHistory[]>({
    queryKey: ["/api/marketing/history"],
    queryFn: () => apiRequest("GET", "/api/marketing/history").then(r => r.json()),
  });

  const { data: integrations } = useQuery({
    queryKey: ["/api/marketing/integrations"],
    queryFn: () => apiRequest("GET", "/api/marketing/integrations").then(r => r.json()),
  });

  const { data: bundles = [] } = useQuery<ContentBundle[]>({
    queryKey: ["/api/marketing/bundles"],
    queryFn: () => apiRequest("GET", "/api/marketing/bundles").then(r => r.json()).catch(() => []),
  });

  const { data: topContent = [] } = useQuery<any[]>({
    queryKey: ["/api/marketing/analytics/top-content"],
    queryFn: () => apiRequest("GET", "/api/marketing/analytics/top-content").then(r => r.json()).catch(() => []),
  });

  const { data: topImages = [] } = useQuery<any[]>({
    queryKey: ["/api/marketing/analytics/top-images"],
    queryFn: () => apiRequest("GET", "/api/marketing/analytics/top-images").then(r => r.json()).catch(() => []),
  });

  const { data: topBundles = [] } = useQuery<any[]>({
    queryKey: ["/api/marketing/analytics/top-bundles"],
    queryFn: () => apiRequest("GET", "/api/marketing/analytics/top-bundles").then(r => r.json()).catch(() => []),
  });

  const { data: timeSlots = [] } = useQuery<any[]>({
    queryKey: ["/api/marketing/analytics/time-slots"],
    queryFn: () => apiRequest("GET", "/api/marketing/analytics/time-slots").then(r => r.json()).catch(() => []),
  });

  // Filtered images for DAM
  const filteredImages = useMemo(() => {
    return images.filter(img => {
      if (styleFilter !== "all" && img.style !== styleFilter) return false;
      if (seasonFilter !== "all" && img.season !== seasonFilter) return false;
      if (categoryFilter !== "all" && img.subject !== categoryFilter) return false;
      if (img.quality < qualityFilter[0] || img.quality > qualityFilter[1]) return false;
      if (searchQuery && !img.filename.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !img.altText?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [images, styleFilter, seasonFilter, categoryFilter, qualityFilter, searchQuery]);

  // Filtered posts
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      if (platformFilter !== "all" && post.platform !== platformFilter) return false;
      if (searchQuery && !post.content.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [posts, platformFilter, searchQuery]);

  // Calendar days
  const calendarDays = useMemo(() => {
    return eachDayOfInterval({
      start: calendarWeekStart,
      end: addDays(calendarWeekStart, 6)
    });
  }, [calendarWeekStart]);

  // Analytics aggregation
  const analyticsData = useMemo(() => {
    const totalImpressions = history.reduce((sum, h) => sum + (h.impressions || 0), 0);
    const totalReach = history.reduce((sum, h) => sum + (h.reach || 0), 0);
    const totalClicks = history.reduce((sum, h) => sum + (h.clicks || 0), 0);
    const totalLikes = history.reduce((sum, h) => sum + (h.likes || 0), 0);
    const totalComments = history.reduce((sum, h) => sum + (h.comments || 0), 0);
    const totalShares = history.reduce((sum, h) => sum + (h.shares || 0), 0);
    const engagementRate = totalImpressions > 0 ? ((totalLikes + totalComments + totalShares) / totalImpressions * 100) : 0;
    const clickRate = totalImpressions > 0 ? (totalClicks / totalImpressions * 100) : 0;
    
    return {
      totalImpressions,
      totalReach,
      totalClicks,
      totalLikes,
      totalComments,
      totalShares,
      engagementRate,
      clickRate,
      postsCount: history.length,
      platformBreakdown: PLATFORMS.map(p => ({
        platform: p.label,
        count: history.filter(h => h.platform === p.id).length
      }))
    };
  }, [history]);

  // Mutations
  const createPostMutation = useMutation({
    mutationFn: (data: typeof newPost) => apiRequest("POST", "/api/marketing/posts", {
      ...data,
      hashtags: data.hashtags.split(",").map(h => h.trim()).filter(Boolean),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/marketing/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/marketing/status"] });
      setNewPost({ content: "", platform: "all", targetSite: "garagebot", hashtags: "", tone: "professional", cta: "none", category: "general" });
      setShowNewPost(false);
      toast({ title: "Post created", description: "Marketing post added to library" });
    },
  });

  const seedContentMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/marketing/seed"),
    onSuccess: async (response) => {
      const data = await response.json();
      queryClient.invalidateQueries({ queryKey: ["/api/marketing/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/marketing/images"] });
      queryClient.invalidateQueries({ queryKey: ["/api/marketing/status"] });
      toast({ 
        title: "Content seeded!", 
        description: `Added ${data.posts} posts and ${data.images} images with Hatch Show Print style` 
      });
    },
    onError: () => {
      toast({ title: "Seed failed", variant: "destructive" });
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/marketing/posts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/marketing/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/marketing/status"] });
      toast({ title: "Post deleted" });
    },
  });

  const postNowMutation = useMutation({
    mutationFn: (data: { postId: string; platforms: string[] }) => 
      apiRequest("POST", "/api/marketing/post-now", data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/marketing/history"] });
      toast({ title: "Posted!", description: `Sent to ${variables.platforms.join(", ")}` });
    },
    onError: () => {
      toast({ title: "Post failed", description: "Check your API credentials", variant: "destructive" });
    },
  });

  const generateAIContentMutation = useMutation({
    mutationFn: (prompt: string) => apiRequest("POST", "/api/marketing/generate", { prompt }),
    onSuccess: async (response) => {
      const data = await response.json();
      setNewPost(prev => ({ ...prev, content: data.content }));
      setShowAIModal(false);
      setShowNewPost(true);
      toast({ title: "Content generated!", description: "AI has created your post" });
    },
    onError: () => {
      toast({ title: "Generation failed", variant: "destructive" });
    },
  });

  const getPlatformIcon = (platform: string) => {
    const p = PLATFORMS.find(pl => pl.id === platform);
    if (p) {
      const Icon = p.icon;
      return <Icon className="w-4 h-4" />;
    }
    return <Megaphone className="w-4 h-4" />;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "posted": return <Badge className="bg-green-500/20 text-green-400"><CheckCircle className="w-3 h-3 mr-1" />Posted</Badge>;
      case "failed": return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      case "scheduled": return <Badge className="bg-blue-500/20 text-blue-400"><Clock className="w-3 h-3 mr-1" />Scheduled</Badge>;
      default: return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  const getCharacterCount = (content: string, platform: string) => {
    const limit = PLATFORM_CHAR_LIMITS[platform as SocialPlatform]?.limit || 280;
    const current = content.length;
    const remaining = limit - current;
    const isOver = remaining < 0;
    return { current, limit, remaining, isOver };
  };

  const charCount = getCharacterCount(newPost.content, newPost.platform);

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="pt-[50px] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Megaphone className="w-8 h-8 text-primary" />
              Marketing Hub
            </h1>
            <p className="text-muted-foreground mt-1">Comprehensive social media automation for GarageBot & DarkWave ecosystem</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button 
              variant="outline" 
              onClick={() => setShowAIModal(true)}
              data-testid="btn-ai-generate"
            >
              <Wand2 className="w-4 h-4 mr-2" />
              AI Generate
            </Button>
            <Button 
              variant="outline" 
              onClick={() => seedContentMutation.mutate()} 
              disabled={seedContentMutation.isPending}
              data-testid="btn-seed-content"
            >
              {seedContentMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              Seed Content
            </Button>
            <Button onClick={() => setShowNewPost(true)} data-testid="btn-new-post">
              <Plus className="w-4 h-4 mr-2" />
              New Post
            </Button>
          </div>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-primary">{status?.stats?.activePosts || posts.length}</div>
              <div className="text-sm text-muted-foreground">Active Posts</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-cyan-400">{status?.stats?.activeImages || images.length}</div>
              <div className="text-sm text-muted-foreground">Images</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-400">{status?.stats?.totalPosted || history.filter(h => h.status === 'posted').length}</div>
              <div className="text-sm text-muted-foreground">Posts Sent</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-purple-400">{analyticsData.totalImpressions.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Impressions</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-blue-400">{analyticsData.engagementRate.toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground">Engagement</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-red-400">{status?.stats?.totalFailed || history.filter(h => h.status === 'failed').length}</div>
              <div className="text-sm text-muted-foreground">Failed</div>
            </CardContent>
          </Card>
        </div>

        {/* Platform Connection Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5" />
              Connected Platforms
            </CardTitle>
            <CardDescription>Social media accounts and posting schedule</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              {PLATFORMS.map(platform => {
                const Icon = platform.icon;
                const isConnected = platform.id === "x" ? integrations?.connectors?.twitter :
                                   platform.id === "facebook" ? integrations?.integration?.facebookConnected :
                                   platform.id === "instagram" ? integrations?.integration?.instagramConnected :
                                   platform.id === "linkedin" ? integrations?.integration?.linkedinConnected :
                                   platform.id === "nextdoor" ? integrations?.integration?.nextdoorConnected :
                                   platform.id === "google" ? integrations?.integration?.googleBusinessConnected : false;
                return (
                  <div key={platform.id} className={`flex items-center gap-2 p-3 rounded-lg border ${isConnected ? 'border-green-500/50 bg-green-500/10' : 'border-muted'}`}>
                    <div className={`p-2 rounded-full ${platform.color}`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{platform.label}</div>
                      <div className="text-xs text-muted-foreground">{isConnected ? "Connected" : "Setup"}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
              <strong>Auto-Schedule:</strong> Posts every 3 hours: 12am, 3am, 6am, 9am, 12pm, 3pm, 6pm, 9pm daily
            </div>
          </CardContent>
        </Card>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <TabsList className="grid grid-cols-6 w-full max-w-2xl">
            <TabsTrigger value="content" className="gap-2" data-testid="tab-content">
              <FileText className="w-4 h-4" />
              Content
            </TabsTrigger>
            <TabsTrigger value="dam" className="gap-2" data-testid="tab-dam">
              <ImageIcon className="w-4 h-4" />
              DAM
            </TabsTrigger>
            <TabsTrigger value="bundles" className="gap-2" data-testid="tab-bundles">
              <Layers className="w-4 h-4" />
              Bundles
            </TabsTrigger>
            <TabsTrigger value="calendar" className="gap-2" data-testid="tab-calendar">
              <Calendar className="w-4 h-4" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2" data-testid="tab-analytics">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="ads" className="gap-2" data-testid="tab-ads">
              <DollarSign className="w-4 h-4" />
              Paid Ads
            </TabsTrigger>
          </TabsList>

          {/* Content Library Tab */}
          <TabsContent value="content" className="space-y-4 mt-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search posts..." 
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="input-search"
                />
              </div>
              <Select value={platformFilter} onValueChange={setPlatformFilter}>
                <SelectTrigger className="w-40" data-testid="filter-platform">
                  <SelectValue placeholder="Platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Platforms</SelectItem>
                  {PLATFORMS.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              {filteredPosts.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No posts yet. Click "Seed Content" or "New Post" to get started.</p>
                  </CardContent>
                </Card>
              ) : (
                filteredPosts.map((post) => (
                  <Card key={post.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="text-sm whitespace-pre-wrap">{post.content}</p>
                          <div className="flex flex-wrap gap-2 mt-3">
                            <Badge variant="outline" className="gap-1">
                              {getPlatformIcon(post.platform)} {post.platform}
                            </Badge>
                            <Badge variant="outline" className="capitalize">{post.targetSite}</Badge>
                            {post.tone && <Badge variant="secondary" className="capitalize">{post.tone}</Badge>}
                            {post.hashtags?.slice(0, 5).map((tag, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">#{tag}</Badge>
                            ))}
                            {post.hashtags?.length > 5 && (
                              <Badge variant="secondary" className="text-xs">+{post.hashtags.length - 5} more</Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground mt-2">
                            Used {post.usageCount}x {post.lastUsedAt && `• Last: ${new Date(post.lastUsedAt).toLocaleDateString()}`}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => navigator.clipboard.writeText(post.content)}
                            title="Copy"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => postNowMutation.mutate({ postId: post.id, platforms: ["x"] })}
                            disabled={!integrations?.connectors?.twitter}
                            data-testid={`btn-post-${post.id}`}
                          >
                            <Send className="w-3 h-3 mr-1" />
                            Post
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => deletePostMutation.mutate(post.id)}
                            data-testid={`btn-delete-${post.id}`}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* DAM (Digital Asset Management) Tab */}
          <TabsContent value="dam" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filter Images
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div>
                    <Label className="text-xs mb-1 block">Style</Label>
                    <Select value={styleFilter} onValueChange={setStyleFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Styles</SelectItem>
                        {IMAGE_STYLES.map(s => (
                          <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs mb-1 block">Season</Label>
                    <Select value={seasonFilter} onValueChange={setSeasonFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Seasons</SelectItem>
                        {IMAGE_SEASONS.map(s => (
                          <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs mb-1 block">Subject</Label>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Subjects</SelectItem>
                        {IMAGE_SUBJECTS.map(s => (
                          <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs mb-1 block">Quality ({qualityFilter[0]} - {qualityFilter[1]} stars)</Label>
                    <Slider
                      value={qualityFilter}
                      onValueChange={setQualityFilter}
                      min={1}
                      max={5}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="text-sm text-muted-foreground mb-2">
              Showing {filteredImages.length} of {images.length} images
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filteredImages.map((image) => (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="group relative"
                >
                  <Card className="overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all">
                    <div className="aspect-square bg-muted relative">
                      <img 
                        src={image.filePath} 
                        alt={image.altText || image.filename}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button size="sm" variant="secondary" onClick={() => setSelectedImage(image)}>
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="secondary" asChild>
                          <a href={image.filePath} download>
                            <Download className="w-3 h-3" />
                          </a>
                        </Button>
                      </div>
                      {image.style === "hatch-print" && (
                        <Badge className="absolute top-2 right-2 bg-amber-500 text-white text-xs">
                          Hatch Print
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground truncate">{image.subject || image.category}</span>
                        <div className="flex items-center gap-0.5">
                          {[...Array(image.quality || 5)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Content Bundles Tab */}
          <TabsContent value="bundles" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Content Bundles</h3>
                <p className="text-sm text-muted-foreground">Pair images with messages for scheduled posting</p>
              </div>
              <Button onClick={() => setShowBundleModal(true)} data-testid="btn-create-bundle">
                <Plus className="w-4 h-4 mr-2" />
                Create Bundle
              </Button>
            </div>

            {bundles.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Layers className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No bundles yet. Create one by pairing an image with a message.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {bundles.map((bundle) => (
                  <Card key={bundle.id} className="overflow-hidden">
                    {bundle.imageUrl && (
                      <div className="aspect-video bg-muted">
                        <img src={bundle.imageUrl} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <CardContent className="p-4">
                      <p className="text-sm line-clamp-3 mb-3">{bundle.message}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        {getStatusBadge(bundle.status)}
                        <Badge variant="outline">{bundle.platform}</Badge>
                        {bundle.postType === "paid_ad" && (
                          <Badge className="bg-purple-500/20 text-purple-400">
                            <DollarSign className="w-3 h-3 mr-1" />
                            Paid
                          </Badge>
                        )}
                      </div>
                      {bundle.scheduledDate && (
                        <div className="text-xs text-muted-foreground mt-2">
                          Scheduled: {new Date(bundle.scheduledDate).toLocaleDateString()}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Calendar Tab */}
          <TabsContent value="calendar" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Posting Calendar</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => setCalendarWeekStart(subWeeks(calendarWeekStart, 1))}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm font-medium min-w-[180px] text-center">
                      {format(calendarWeekStart, "MMM d")} - {format(addDays(calendarWeekStart, 6), "MMM d, yyyy")}
                    </span>
                    <Button size="sm" variant="outline" onClick={() => setCalendarWeekStart(addWeeks(calendarWeekStart, 1))}>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2">
                  {calendarDays.map((day, index) => {
                    const isToday = isSameDay(day, new Date());
                    const dayPosts = history.filter(h => 
                      h.postedAt && isSameDay(new Date(h.postedAt), day)
                    );
                    return (
                      <div 
                        key={index}
                        className={`min-h-[120px] p-2 rounded-lg border ${isToday ? 'border-primary bg-primary/10' : 'border-muted'}`}
                      >
                        <div className={`text-sm font-medium ${isToday ? 'text-primary' : 'text-muted-foreground'}`}>
                          {format(day, "EEE")}
                        </div>
                        <div className={`text-lg font-bold ${isToday ? 'text-primary' : ''}`}>
                          {format(day, "d")}
                        </div>
                        <div className="mt-2 space-y-1">
                          {dayPosts.slice(0, 3).map((post, i) => (
                            <div key={i} className="flex items-center gap-1">
                              {getPlatformIcon(post.platform)}
                              <span className="text-xs truncate">{post.status}</span>
                            </div>
                          ))}
                          {dayPosts.length > 3 && (
                            <span className="text-xs text-muted-foreground">+{dayPosts.length - 3} more</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4 mt-4">
            {/* Overview Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Eye className="w-4 h-4" />
                    <span className="text-sm">Impressions</span>
                  </div>
                  <div className="text-3xl font-bold">{analyticsData.totalImpressions.toLocaleString()}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Target className="w-4 h-4" />
                    <span className="text-sm">Reach</span>
                  </div>
                  <div className="text-3xl font-bold">{analyticsData.totalReach.toLocaleString()}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm">Engagement Rate</span>
                  </div>
                  <div className="text-3xl font-bold">{analyticsData.engagementRate.toFixed(2)}%</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <ExternalLink className="w-4 h-4" />
                    <span className="text-sm">Click Rate</span>
                  </div>
                  <div className="text-3xl font-bold">{analyticsData.clickRate.toFixed(2)}%</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Engagement Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Engagement Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Likes</span>
                      <span className="font-bold">{analyticsData.totalLikes.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Comments</span>
                      <span className="font-bold">{analyticsData.totalComments.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Shares</span>
                      <span className="font-bold">{analyticsData.totalShares.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Clicks</span>
                      <span className="font-bold">{analyticsData.totalClicks.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Posts by Platform */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Posts by Platform</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analyticsData.platformBreakdown.map(item => (
                      <div key={item.platform} className="flex justify-between items-center">
                        <span className="text-sm">{item.platform}</span>
                        <span className="font-bold">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Performing Messages */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  Top Performing Messages
                </CardTitle>
                <CardDescription>Messages ranked by total engagement (likes + comments + shares)</CardDescription>
              </CardHeader>
              <CardContent>
                {topContent.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">No performance data yet. Posts will appear here once they start getting engagement.</p>
                ) : (
                  <div className="space-y-3">
                    {topContent.map((item: any, index: number) => (
                      <div key={index} className="p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3 flex-1">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${index === 0 ? 'bg-yellow-500/20 text-yellow-400' : index === 1 ? 'bg-gray-400/20 text-gray-300' : index === 2 ? 'bg-amber-700/20 text-amber-600' : 'bg-muted text-muted-foreground'}`}>
                              #{index + 1}
                            </div>
                            <p className="text-sm line-clamp-2 flex-1">{item.content}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-sm font-bold text-green-400">{Number(item.engagement).toLocaleString()} eng</div>
                            <div className="text-xs text-muted-foreground">{Number(item.totalImpressions).toLocaleString()} imp</div>
                            <div className="text-xs text-muted-foreground">{Number(item.postCount)} posts</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top Performing Images */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ImageIcon className="w-5 h-5 text-blue-400" />
                  Top Performing Images
                </CardTitle>
                <CardDescription>Images ranked by engagement when used in posts</CardDescription>
              </CardHeader>
              <CardContent>
                {topImages.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">No image performance data yet.</p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {topImages.map((item: any, index: number) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                          <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className={`absolute top-2 left-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${index === 0 ? 'bg-yellow-500 text-black' : index === 1 ? 'bg-gray-400 text-black' : index === 2 ? 'bg-amber-700 text-white' : 'bg-black/60 text-white'}`}>
                          {index + 1}
                        </div>
                        <div className="mt-1 text-center">
                          <div className="text-xs font-bold text-green-400">{Number(item.engagement).toLocaleString()} eng</div>
                          <div className="text-xs text-muted-foreground">{Number(item.postCount)} uses</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Best Posting Times */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="w-5 h-5 text-purple-400" />
                  Best Posting Times
                </CardTitle>
                <CardDescription>Average engagement by time of day</CardDescription>
              </CardHeader>
              <CardContent>
                {timeSlots.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">No time slot data yet. Engagement data will appear as posts accumulate.</p>
                ) : (
                  <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                    {timeSlots.map((slot: any, index: number) => {
                      const maxEng = Math.max(...timeSlots.map((s: any) => Number(s.avgEngagement) || 0), 1);
                      const pct = ((Number(slot.avgEngagement) || 0) / maxEng) * 100;
                      const hour = Number(slot.hour);
                      const label = hour === 0 ? '12am' : hour < 12 ? `${hour}am` : hour === 12 ? '12pm' : `${hour - 12}pm`;
                      return (
                        <div key={index} className="text-center">
                          <div className="h-24 flex items-end justify-center mb-1">
                            <div className="w-8 rounded-t bg-primary/60 transition-all" style={{ height: `${Math.max(pct, 5)}%` }} />
                          </div>
                          <div className="text-xs font-medium">{label}</div>
                          <div className="text-xs text-muted-foreground">{Number(slot.postCount)} posts</div>
                          <div className="text-xs text-green-400">{Number(slot.avgEngagement).toFixed(0)} avg</div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top Bundles (Image+Message Combinations) */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Layers className="w-5 h-5 text-cyan-400" />
                  Top Image+Message Combinations
                </CardTitle>
                <CardDescription>Best performing content bundles by total engagement</CardDescription>
              </CardHeader>
              <CardContent>
                {topBundles.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">No bundle performance data yet. Create content bundles and they'll be ranked here.</p>
                ) : (
                  <div className="space-y-4">
                    {topBundles.map((bundle: any, index: number) => {
                      const eng = (bundle.likes || 0) + (bundle.comments || 0) + (bundle.shares || 0);
                      return (
                        <div key={bundle.id} className="flex gap-4 p-3 bg-muted/50 rounded-lg">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${index === 0 ? 'bg-yellow-500/20 text-yellow-400' : index === 1 ? 'bg-gray-400/20 text-gray-300' : index === 2 ? 'bg-amber-700/20 text-amber-600' : 'bg-muted text-muted-foreground'}`}>
                            #{index + 1}
                          </div>
                          {bundle.imageUrl && (
                            <div className="w-16 h-16 rounded overflow-hidden bg-muted shrink-0">
                              <img src={bundle.imageUrl} alt="" className="w-full h-full object-cover" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm line-clamp-2">{bundle.message}</p>
                            <div className="flex gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">{bundle.platform}</Badge>
                              {getStatusBadge(bundle.status)}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-sm font-bold text-green-400">{eng.toLocaleString()} eng</div>
                            <div className="text-xs text-muted-foreground">{(bundle.impressions || 0).toLocaleString()} imp</div>
                            <div className="text-xs text-muted-foreground">{(bundle.clicks || 0).toLocaleString()} clicks</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Post History */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Posts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {history.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">No post history yet.</p>
                  ) : history.slice(0, 10).map((item) => (
                    <div key={item.id} className="flex items-start justify-between gap-4 p-3 bg-muted/50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getPlatformIcon(item.platform)}
                          <span className="capitalize font-medium">{item.platform}</span>
                          {getStatusBadge(item.status)}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">{item.content}</p>
                        {item.error && <p className="text-xs text-red-400 mt-1">{item.error}</p>}
                      </div>
                      <div className="text-right text-xs text-muted-foreground">
                        <div>{item.impressions || 0} imp · {item.likes || 0} likes · {item.shares || 0} shares</div>
                        <div>{item.postedAt ? new Date(item.postedAt).toLocaleDateString() : 'Pending'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Paid Ads Tab */}
          <TabsContent value="ads" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Paid Advertising
                </CardTitle>
                <CardDescription>Manage paid ad campaigns with budget allocation and audience targeting</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="text-sm text-muted-foreground">Daily Budget</div>
                    <div className="text-2xl font-bold text-green-400">$0.00</div>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="text-sm text-muted-foreground">Total Spend</div>
                    <div className="text-2xl font-bold text-purple-400">$0.00</div>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="text-sm text-muted-foreground">Active Campaigns</div>
                    <div className="text-2xl font-bold text-blue-400">0</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Target Audiences</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {TARGET_AUDIENCES.map(audience => (
                      <div key={audience.id} className="p-3 border rounded-lg hover:border-primary cursor-pointer transition-colors">
                        <div className="font-medium text-sm">{audience.label}</div>
                        <div className="text-xs text-muted-foreground">Click to create campaign</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="font-medium mb-3">Budget Ranges</h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {BUDGET_RANGES.filter(b => b.id !== "none").map(budget => (
                      <div key={budget.id} className="p-3 border rounded-lg text-center hover:border-primary cursor-pointer transition-colors">
                        <div className="font-bold text-primary">{budget.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* New Post Modal */}
        <Dialog open={showNewPost} onOpenChange={setShowNewPost}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Marketing Post</DialogTitle>
              <DialogDescription>Add a new post to your content library</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Message</Label>
                <Textarea
                  placeholder="Write your marketing message..."
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  rows={4}
                  className="mt-1"
                  data-testid="input-post-content"
                />
                <div className={`text-xs mt-1 ${charCount.isOver ? 'text-red-500' : 'text-muted-foreground'}`}>
                  {charCount.current} / {charCount.limit} characters ({charCount.remaining} remaining)
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <Label>Platform</Label>
                  <Select value={newPost.platform} onValueChange={(v) => setNewPost({ ...newPost, platform: v })}>
                    <SelectTrigger className="mt-1" data-testid="select-platform">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Platforms</SelectItem>
                      {PLATFORMS.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Target Site</Label>
                  <Select value={newPost.targetSite} onValueChange={(v) => setNewPost({ ...newPost, targetSite: v })}>
                    <SelectTrigger className="mt-1" data-testid="select-target">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ECOSYSTEM_SITES.map(site => (
                        <SelectItem key={site.value} value={site.value}>{site.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Tone</Label>
                  <Select value={newPost.tone} onValueChange={(v) => setNewPost({ ...newPost, tone: v })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MESSAGE_TONES.map(t => (
                        <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Call to Action</Label>
                  <Select value={newPost.cta} onValueChange={(v) => setNewPost({ ...newPost, cta: v })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MESSAGE_CTAS.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Hashtags (comma-separated)</Label>
                  <Input
                    placeholder="GarageBot, AutoParts, DIY"
                    value={newPost.hashtags}
                    onChange={(e) => setNewPost({ ...newPost, hashtags: e.target.value })}
                    className="mt-1"
                    data-testid="input-hashtags"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewPost(false)}>Cancel</Button>
              <Button 
                onClick={() => createPostMutation.mutate(newPost)} 
                disabled={!newPost.content || charCount.isOver || createPostMutation.isPending}
                data-testid="btn-save-post"
              >
                {createPostMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                Add to Library
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* AI Generate Modal */}
        <Dialog open={showAIModal} onOpenChange={setShowAIModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-primary" />
                AI Content Generator
              </DialogTitle>
              <DialogDescription>Describe what you want to post about and AI will generate content</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>What should the post be about?</Label>
                <Textarea
                  placeholder="e.g., Promote our 50+ retailer price comparison feature for brake pads..."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  rows={4}
                  className="mt-1"
                />
              </div>
              <div className="text-sm text-muted-foreground">
                The AI will generate a social media post with relevant hashtags optimized for engagement.
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAIModal(false)}>Cancel</Button>
              <Button 
                onClick={() => generateAIContentMutation.mutate(aiPrompt)} 
                disabled={!aiPrompt || generateAIContentMutation.isPending}
              >
                {generateAIContentMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                Generate
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Bundle Modal */}
        <Dialog open={showBundleModal} onOpenChange={setShowBundleModal}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Create Content Bundle</DialogTitle>
              <DialogDescription>Pair an image with a message for scheduled posting</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label>Select Image</Label>
                <div className="grid grid-cols-3 gap-2 mt-2 max-h-[300px] overflow-y-auto">
                  {images.slice(0, 12).map(img => (
                    <div 
                      key={img.id}
                      onClick={() => setNewBundle({ ...newBundle, imageId: img.id })}
                      className={`aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                        newBundle.imageId === img.id ? 'border-primary ring-2 ring-primary/30' : 'border-transparent hover:border-muted'
                      }`}
                    >
                      <img src={img.filePath} alt={img.altText} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label>Select Message</Label>
                  <Select value={newBundle.messageId} onValueChange={(v) => setNewBundle({ ...newBundle, messageId: v })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Choose a post..." />
                    </SelectTrigger>
                    <SelectContent>
                      {posts.slice(0, 10).map(post => (
                        <SelectItem key={post.id} value={post.id}>
                          {post.content.slice(0, 50)}...
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Platform</Label>
                  <Select value={newBundle.platform} onValueChange={(v) => setNewBundle({ ...newBundle, platform: v })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Platforms</SelectItem>
                      {PLATFORMS.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Post Type</Label>
                  <Select value={newBundle.postType} onValueChange={(v) => setNewBundle({ ...newBundle, postType: v })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="organic">Organic</SelectItem>
                      <SelectItem value="paid_ad">Paid Ad</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {newBundle.postType === "paid_ad" && (
                  <>
                    <div>
                      <Label>Target Audience</Label>
                      <Select value={newBundle.targetAudience} onValueChange={(v) => setNewBundle({ ...newBundle, targetAudience: v })}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select audience..." />
                        </SelectTrigger>
                        <SelectContent>
                          {TARGET_AUDIENCES.map(a => (
                            <SelectItem key={a.id} value={a.id}>{a.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Budget Range</Label>
                      <Select value={newBundle.budgetRange} onValueChange={(v) => setNewBundle({ ...newBundle, budgetRange: v })}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {BUDGET_RANGES.map(b => (
                            <SelectItem key={b.id} value={b.id}>{b.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowBundleModal(false)}>Cancel</Button>
              <Button 
                disabled={!newBundle.imageId || !newBundle.messageId}
                onClick={() => {
                  toast({ title: "Bundle created", description: "Content bundle saved" });
                  setShowBundleModal(false);
                }}
              >
                <Layers className="w-4 h-4 mr-2" />
                Create Bundle
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Image Preview Modal */}
        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedImage?.filename}</DialogTitle>
            </DialogHeader>
            {selectedImage && (
              <div className="space-y-4">
                <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                  <img src={selectedImage.filePath} alt={selectedImage.altText} className="w-full h-full object-contain" />
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Subject:</span> {selectedImage.subject || "N/A"}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Style:</span> {selectedImage.style || "N/A"}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Season:</span> {selectedImage.season || "all-year"}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Quality:</span> {selectedImage.quality || 5}/5
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button asChild className="flex-1">
                    <a href={selectedImage.filePath} download>
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </a>
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => {
                    setSelectedImage(null);
                    setShowBundleModal(true);
                  }}>
                    <Layers className="w-4 h-4 mr-2" />
                    Create Bundle
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
      </div>
      <Footer />
    </div>
  );
}
