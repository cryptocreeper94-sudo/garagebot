import { useState } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { 
  Plus, Heart, Share2, Trash2, ExternalLink, Eye, Copy, 
  Check, ShoppingCart, Loader2, Package
} from "lucide-react";

interface WishlistItem {
  id: string;
  wishlistId: string;
  partName: string;
  partNumber?: string;
  vendorSlug?: string;
  estimatedPrice?: string;
  quantity: number;
  priority: string;
  notes?: string;
  isPurchased: boolean;
  createdAt: string;
}

interface Wishlist {
  id: string;
  userId: string;
  name: string;
  description?: string;
  vehicleId?: string;
  isPublic: boolean;
  shareCode?: string;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function Wishlists() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedWishlist, setSelectedWishlist] = useState<string | null>(null);
  const [newWishlist, setNewWishlist] = useState({ name: "", description: "", isPublic: false });
  const [addItemOpen, setAddItemOpen] = useState(false);
  const [newItem, setNewItem] = useState({ partName: "", partNumber: "", estimatedPrice: "", quantity: "1", priority: "medium", notes: "" });
  const [copied, setCopied] = useState(false);

  const { data: wishlists = [], isLoading: wishlistsLoading, error: wishlistsError } = useQuery<Wishlist[]>({
    queryKey: ["/api/wishlists"],
    enabled: !!user,
  });

  const { data: wishlistDetails, isLoading: detailsLoading, error: wishlistError } = useQuery<{ wishlist: Wishlist; items: WishlistItem[] }>({
    queryKey: ["/api/wishlists", selectedWishlist],
    queryFn: async () => {
      const res = await fetch(`/api/wishlists/${selectedWishlist}`);
      if (!res.ok) throw new Error("Failed to fetch wishlist details");
      return res.json();
    },
    enabled: !!selectedWishlist,
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof newWishlist) => {
      const res = await fetch("/api/wishlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create wishlist");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishlists"] });
      setCreateOpen(false);
      setNewWishlist({ name: "", description: "", isPublic: false });
      toast({ title: "Wishlist created!" });
    },
    onError: () => {
      toast({ title: "Failed to create wishlist", variant: "destructive" });
    },
  });

  const addItemMutation = useMutation({
    mutationFn: async (data: typeof newItem) => {
      const res = await fetch(`/api/wishlists/${selectedWishlist}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, quantity: parseInt(data.quantity) }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to add item");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishlists", selectedWishlist] });
      setAddItemOpen(false);
      setNewItem({ partName: "", partNumber: "", estimatedPrice: "", quantity: "1", priority: "medium", notes: "" });
      toast({ title: "Item added to wishlist!" });
    },
    onError: () => {
      toast({ title: "Failed to add item", variant: "destructive" });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const res = await fetch(`/api/wishlists/${selectedWishlist}/items/${itemId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete item");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishlists", selectedWishlist] });
      toast({ title: "Item removed" });
    },
    onError: () => {
      toast({ title: "Failed to remove item", variant: "destructive" });
    },
  });

  const copyShareLink = (shareCode: string) => {
    const url = `${window.location.origin}/wishlist/${shareCode}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Share link copied!" });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "destructive";
      case "medium": return "default";
      case "low": return "secondary";
      default: return "outline";
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Nav />
        <main className="container mx-auto px-4 py-16 text-center">
          <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-3xl font-bold mb-4">Sign in to view your wishlists</h1>
          <p className="text-muted-foreground mb-8">Create and share parts wishlists with friends and family</p>
          <Button asChild>
            <a href="/auth">Sign In</a>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3" data-testid="text-page-title">
              <Heart className="w-8 h-8 text-primary" />
              My Wishlists
            </h1>
            <p className="text-muted-foreground mt-2">Save and share parts you want for your vehicles</p>
          </div>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90" data-testid="button-create-wishlist">
                <Plus className="w-4 h-4 mr-2" />
                New Wishlist
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-ultra border-primary/30">
              <DialogHeader>
                <DialogTitle>Create Wishlist</DialogTitle>
                <DialogDescription>Create a new wishlist to save parts you want</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Name</Label>
                  <Input 
                    value={newWishlist.name}
                    onChange={(e) => setNewWishlist({ ...newWishlist, name: e.target.value })}
                    placeholder="e.g., Summer Project Parts"
                    data-testid="input-wishlist-name"
                  />
                </div>
                <div>
                  <Label>Description (optional)</Label>
                  <Textarea 
                    value={newWishlist.description}
                    onChange={(e) => setNewWishlist({ ...newWishlist, description: e.target.value })}
                    placeholder="Describe what this wishlist is for..."
                    data-testid="input-wishlist-description"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Make Public</Label>
                    <p className="text-sm text-muted-foreground">Allow others to view with a share link</p>
                  </div>
                  <Switch 
                    checked={newWishlist.isPublic}
                    onCheckedChange={(checked) => setNewWishlist({ ...newWishlist, isPublic: checked })}
                    data-testid="switch-wishlist-public"
                  />
                </div>
                <Button 
                  onClick={() => createMutation.mutate(newWishlist)}
                  disabled={!newWishlist.name || createMutation.isPending}
                  className="w-full"
                  data-testid="button-submit-wishlist"
                >
                  {createMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Create Wishlist
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card className="glass-ultra border-primary/20 p-4">
              <h2 className="text-lg font-semibold mb-4">Your Wishlists</h2>
              {wishlistsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : wishlistsError ? (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 mx-auto mb-4 text-destructive" />
                  <p className="text-destructive font-medium">Failed to load wishlists</p>
                  <p className="text-sm text-muted-foreground">Please try again later</p>
                </div>
              ) : wishlists.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No wishlists yet</p>
                  <p className="text-sm text-muted-foreground">Create one to get started!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {wishlists.map((wishlist) => (
                    <motion.div
                      key={wishlist.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-3 rounded-lg cursor-pointer transition-all ${
                        selectedWishlist === wishlist.id 
                          ? "bg-primary/20 border border-primary/40" 
                          : "glass-card hover:bg-card/80 border border-transparent"
                      }`}
                      onClick={() => setSelectedWishlist(wishlist.id)}
                      data-testid={`card-wishlist-${wishlist.id}`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{wishlist.name}</h3>
                          {wishlist.description && (
                            <p className="text-sm text-muted-foreground truncate max-w-[180px]">{wishlist.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {wishlist.isPublic && (
                            <Badge variant="outline" className="text-xs">
                              <Eye className="w-3 h-3 mr-1" />
                              {wishlist.viewCount || 0}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          <div className="lg:col-span-2">
            {!selectedWishlist ? (
              <Card className="glass-ultra border-primary/20 p-8 text-center">
                <Heart className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Select a wishlist to view items</p>
              </Card>
            ) : detailsLoading ? (
              <Card className="glass-ultra border-primary/20 p-8 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </Card>
            ) : wishlistError ? (
              <Card className="glass-ultra border-destructive/20 p-8 text-center">
                <Package className="w-12 h-12 mx-auto mb-4 text-destructive" />
                <p className="text-destructive font-medium">Failed to load wishlist</p>
                <p className="text-sm text-muted-foreground mt-2">Please try again later</p>
              </Card>
            ) : wishlistDetails ? (
              <Card className="glass-ultra border-primary/20 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold">{wishlistDetails.wishlist.name}</h2>
                    {wishlistDetails.wishlist.description && (
                      <p className="text-muted-foreground">{wishlistDetails.wishlist.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {wishlistDetails.wishlist.isPublic && wishlistDetails.wishlist.shareCode && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => copyShareLink(wishlistDetails.wishlist.shareCode!)}
                        data-testid="button-copy-share"
                      >
                        {copied ? <Check className="w-4 h-4 mr-2" /> : <Share2 className="w-4 h-4 mr-2" />}
                        {copied ? "Copied!" : "Share"}
                      </Button>
                    )}
                    <Dialog open={addItemOpen} onOpenChange={setAddItemOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" data-testid="button-add-item">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Item
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="glass-ultra border-primary/30">
                        <DialogHeader>
                          <DialogTitle>Add Item to Wishlist</DialogTitle>
                          <DialogDescription>Add a part to your wishlist</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Part Name *</Label>
                            <Input 
                              value={newItem.partName}
                              onChange={(e) => setNewItem({ ...newItem, partName: e.target.value })}
                              placeholder="e.g., Brake Pads - Front"
                              data-testid="input-item-name"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Part Number</Label>
                              <Input 
                                value={newItem.partNumber}
                                onChange={(e) => setNewItem({ ...newItem, partNumber: e.target.value })}
                                placeholder="Optional"
                              />
                            </div>
                            <div>
                              <Label>Est. Price</Label>
                              <Input 
                                value={newItem.estimatedPrice}
                                onChange={(e) => setNewItem({ ...newItem, estimatedPrice: e.target.value })}
                                placeholder="$0.00"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Quantity</Label>
                              <Input 
                                type="number"
                                value={newItem.quantity}
                                onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                                min="1"
                              />
                            </div>
                            <div>
                              <Label>Priority</Label>
                              <select 
                                value={newItem.priority}
                                onChange={(e) => setNewItem({ ...newItem, priority: e.target.value })}
                                className="w-full h-10 px-3 rounded-md bg-background border border-input"
                              >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                              </select>
                            </div>
                          </div>
                          <div>
                            <Label>Notes</Label>
                            <Textarea 
                              value={newItem.notes}
                              onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                              placeholder="Any additional notes..."
                            />
                          </div>
                          <Button 
                            onClick={() => addItemMutation.mutate(newItem)}
                            disabled={!newItem.partName || addItemMutation.isPending}
                            className="w-full"
                            data-testid="button-submit-item"
                          >
                            {addItemMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                            Add to Wishlist
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                {wishlistDetails.items.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No items in this wishlist</p>
                    <p className="text-sm text-muted-foreground">Add parts you want to save for later</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {wishlistDetails.items.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between p-4 rounded-lg glass-card border border-border/50"
                        data-testid={`row-item-${item.id}`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{item.partName}</h3>
                            <Badge variant={getPriorityColor(item.priority)} className="text-xs">
                              {item.priority}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            {item.partNumber && <span>#{item.partNumber}</span>}
                            {item.estimatedPrice && <span>{item.estimatedPrice}</span>}
                            <span>Qty: {item.quantity}</span>
                          </div>
                          {item.notes && <p className="text-sm text-muted-foreground mt-1">{item.notes}</p>}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteItemMutation.mutate(item.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          data-testid={`button-delete-item-${item.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </Card>
            ) : null}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
