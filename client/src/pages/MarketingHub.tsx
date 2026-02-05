import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Megaphone, Plus, Send, Clock, CheckCircle, XCircle, Image, 
  Twitter, Facebook, Instagram, RefreshCw, Trash2, Eye 
} from "lucide-react";

interface MarketingPost {
  id: string;
  content: string;
  platform: string;
  hashtags: string[];
  targetSite: string;
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
  altText: string;
  isActive: boolean;
  usageCount: number;
}

interface PostHistory {
  id: string;
  platform: string;
  content: string;
  status: string;
  externalPostId: string | null;
  error: string | null;
  postedAt: string | null;
  createdAt: string;
}

const ECOSYSTEM_SITES = [
  { value: "garagebot", label: "GarageBot", url: "garagebot.io" },
  { value: "dwtl", label: "DarkWave", url: "dwtl.io" },
  { value: "tlid", label: "Trust Layer", url: "tlid.io" },
  { value: "trustshield", label: "TrustShield", url: "trustshield.io" },
];

export default function MarketingHub() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newPost, setNewPost] = useState({ content: "", platform: "all", targetSite: "garagebot", hashtags: "" });
  const [showNewPost, setShowNewPost] = useState(false);

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

  const createPostMutation = useMutation({
    mutationFn: (data: typeof newPost) => apiRequest("POST", "/api/marketing/posts", {
      ...data,
      hashtags: data.hashtags.split(",").map(h => h.trim()).filter(Boolean),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/marketing/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/marketing/status"] });
      setNewPost({ content: "", platform: "all", targetSite: "garagebot", hashtags: "" });
      setShowNewPost(false);
      toast({ title: "Post created", description: "Marketing post added to library" });
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

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "x": return <Twitter className="w-4 h-4" />;
      case "facebook": return <Facebook className="w-4 h-4" />;
      case "instagram": return <Instagram className="w-4 h-4" />;
      default: return <Megaphone className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "posted": return <Badge className="bg-green-500/20 text-green-400"><CheckCircle className="w-3 h-3 mr-1" />Posted</Badge>;
      case "failed": return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      default: return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Megaphone className="w-8 h-8 text-primary" />
              Marketing Hub
            </h1>
            <p className="text-muted-foreground mt-1">Automated social media posting for the DarkWave ecosystem</p>
          </div>
          <Button onClick={() => setShowNewPost(true)} data-testid="btn-new-post">
            <Plus className="w-4 h-4 mr-2" />
            New Post
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-primary">{status?.stats?.activePosts || 0}</div>
              <div className="text-sm text-muted-foreground">Active Posts</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-primary">{status?.stats?.activeImages || 0}</div>
              <div className="text-sm text-muted-foreground">Marketing Images</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-400">{status?.stats?.totalPosted || 0}</div>
              <div className="text-sm text-muted-foreground">Posts Sent</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-red-400">{status?.stats?.totalFailed || 0}</div>
              <div className="text-sm text-muted-foreground">Failed Posts</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5" />
              Connected Platforms
            </CardTitle>
            <CardDescription>Configure your social media accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-card border">
                <Twitter className="w-6 h-6 text-blue-400" />
                <div className="flex-1">
                  <div className="font-medium">X / Twitter</div>
                  <div className="text-sm text-muted-foreground">
                    {integrations?.connectors?.twitter ? "Connected" : "Add API keys in Secrets"}
                  </div>
                </div>
                <Badge variant={integrations?.connectors?.twitter ? "default" : "secondary"}>
                  {integrations?.connectors?.twitter ? "Ready" : "Setup"}
                </Badge>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-card border">
                <Facebook className="w-6 h-6 text-blue-600" />
                <div className="flex-1">
                  <div className="font-medium">Facebook</div>
                  <div className="text-sm text-muted-foreground">
                    {integrations?.integration?.facebookConnected ? "Connected" : "Connect your Page"}
                  </div>
                </div>
                <Badge variant={integrations?.integration?.facebookConnected ? "default" : "secondary"}>
                  {integrations?.integration?.facebookConnected ? "Ready" : "Setup"}
                </Badge>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-card border">
                <Instagram className="w-6 h-6 text-pink-500" />
                <div className="flex-1">
                  <div className="font-medium">Instagram</div>
                  <div className="text-sm text-muted-foreground">
                    {integrations?.integration?.instagramConnected ? "Connected" : "Connect via Facebook"}
                  </div>
                </div>
                <Badge variant={integrations?.integration?.instagramConnected ? "default" : "secondary"}>
                  {integrations?.integration?.instagramConnected ? "Ready" : "Setup"}
                </Badge>
              </div>
            </div>
            <div className="mt-4 p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
              <strong>Schedule:</strong> Posts automatically at 8am, 10am, 12pm, 2pm, 4pm, 6pm, 8pm daily
            </div>
          </CardContent>
        </Card>

        {showNewPost && (
          <Card>
            <CardHeader>
              <CardTitle>Create Marketing Post</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Write your marketing message..."
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                rows={4}
                data-testid="input-post-content"
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Platform</label>
                  <Select value={newPost.platform} onValueChange={(v) => setNewPost({ ...newPost, platform: v })}>
                    <SelectTrigger data-testid="select-platform">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Platforms</SelectItem>
                      <SelectItem value="x">X / Twitter</SelectItem>
                      <SelectItem value="facebook">Facebook</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Target Site</label>
                  <Select value={newPost.targetSite} onValueChange={(v) => setNewPost({ ...newPost, targetSite: v })}>
                    <SelectTrigger data-testid="select-target">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ECOSYSTEM_SITES.map(site => (
                        <SelectItem key={site.value} value={site.value}>{site.label} ({site.url})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Hashtags (comma-separated)</label>
                  <Input
                    placeholder="GarageBot, AutoParts, DIY"
                    value={newPost.hashtags}
                    onChange={(e) => setNewPost({ ...newPost, hashtags: e.target.value })}
                    data-testid="input-hashtags"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => createPostMutation.mutate(newPost)} disabled={!newPost.content} data-testid="btn-save-post">
                  <Plus className="w-4 h-4 mr-2" />
                  Add to Library
                </Button>
                <Button variant="outline" onClick={() => setShowNewPost(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="posts">
          <TabsList>
            <TabsTrigger value="posts" data-testid="tab-posts">Content Library ({posts.length})</TabsTrigger>
            <TabsTrigger value="images" data-testid="tab-images">Images ({images.length})</TabsTrigger>
            <TabsTrigger value="history" data-testid="tab-history">Post History ({history.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="space-y-4 mt-4">
            {posts.map((post) => (
              <Card key={post.id}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-sm whitespace-pre-wrap">{post.content}</p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <Badge variant="outline">{getPlatformIcon(post.platform)} {post.platform}</Badge>
                        <Badge variant="outline" className="capitalize">{post.targetSite}</Badge>
                        {post.hashtags?.map((tag, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">#{tag}</Badge>
                        ))}
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">
                        Used {post.usageCount}x {post.lastUsedAt && `• Last: ${new Date(post.lastUsedAt).toLocaleDateString()}`}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => postNowMutation.mutate({ postId: post.id, platforms: ["x"] })}
                        disabled={!integrations?.connectors?.twitter}
                        data-testid={`btn-post-${post.id}`}
                      >
                        <Send className="w-3 h-3 mr-1" />
                        Post Now
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
            ))}
          </TabsContent>

          <TabsContent value="images" className="mt-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {images.map((image) => (
                <Card key={image.id} className="overflow-hidden">
                  <div className="aspect-square bg-muted relative">
                    <img 
                      src={image.filePath} 
                      alt={image.altText || image.filename}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-3">
                    <div className="text-sm font-medium truncate">{image.filename}</div>
                    <div className="text-xs text-muted-foreground">
                      Used {image.usageCount}x • {image.category}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4 mt-4">
            {history.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No posts sent yet. Connect your social accounts and the scheduler will start posting automatically.
                </CardContent>
              </Card>
            ) : (
              history.map((item) => (
                <Card key={item.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getPlatformIcon(item.platform)}
                          <span className="capitalize font-medium">{item.platform}</span>
                          {getStatusBadge(item.status)}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{item.content}</p>
                        {item.error && <p className="text-xs text-red-400 mt-1">{item.error}</p>}
                        <div className="text-xs text-muted-foreground mt-2">
                          {item.postedAt ? new Date(item.postedAt).toLocaleString() : new Date(item.createdAt).toLocaleString()}
                        </div>
                      </div>
                      {item.externalPostId && (
                        <Button size="sm" variant="ghost" asChild>
                          <a href={`https://x.com/i/status/${item.externalPostId}`} target="_blank" rel="noopener">
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
