import { useRoute } from "wouter";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Heart, Package, Loader2, Eye, ExternalLink, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

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

export default function SharedWishlist() {
  const [, params] = useRoute("/wishlist/:shareCode");
  const shareCode = params?.shareCode;

  const { data, isLoading, error } = useQuery<{ wishlist: Wishlist; items: WishlistItem[] }>({
    queryKey: ["/api/wishlists/share", shareCode],
    queryFn: async () => {
      const res = await fetch(`/api/wishlists/share/${shareCode}`);
      if (!res.ok) throw new Error("Wishlist not found");
      return res.json();
    },
    enabled: !!shareCode,
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "destructive";
      case "medium": return "default";
      case "low": return "secondary";
      default: return "outline";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background">
        <Nav />
        <main className="container mx-auto px-4 py-16 text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-destructive" />
          <h1 className="text-3xl font-bold mb-4">Wishlist Not Found</h1>
          <p className="text-muted-foreground mb-8">This wishlist may be private or no longer exists.</p>
          <Button asChild>
            <a href="/">Go Home</a>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="glass-dark border-primary/20 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-3">
                <Heart className="w-8 h-8 text-primary" />
                <h1 className="text-3xl font-bold" data-testid="text-wishlist-title">{data.wishlist.name}</h1>
              </div>
              {data.wishlist.description && (
                <p className="text-muted-foreground mt-2">{data.wishlist.description}</p>
              )}
            </div>
            <Badge variant="outline" className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {data.wishlist.viewCount || 0} views
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Shared wishlist with {data.items.length} item{data.items.length !== 1 ? 's' : ''}
          </p>
        </Card>

        {data.items.length === 0 ? (
          <Card className="glass-dark border-primary/20 p-8 text-center">
            <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">This wishlist is empty</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {data.items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="glass-dark border-primary/20 p-4" data-testid={`card-item-${item.id}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-lg">{item.partName}</h3>
                        <Badge variant={getPriorityColor(item.priority)} className="text-xs">
                          {item.priority}
                        </Badge>
                        {item.isPurchased && (
                          <Badge variant="default" className="bg-green-600">Purchased</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        {item.partNumber && <span>Part #: {item.partNumber}</span>}
                        {item.estimatedPrice && <span className="font-medium text-foreground">{item.estimatedPrice}</span>}
                        <span>Qty: {item.quantity}</span>
                      </div>
                      {item.notes && <p className="text-sm text-muted-foreground mt-2">{item.notes}</p>}
                    </div>
                    {item.vendorSlug && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={`/results?vendor=${item.vendorSlug}&q=${encodeURIComponent(item.partName)}`}>
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Find
                        </a>
                      </Button>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <p className="text-muted-foreground mb-4">Want to create your own wishlists?</p>
          <Button asChild>
            <a href="/wishlists">Create Wishlist</a>
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
