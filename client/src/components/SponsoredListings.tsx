import { motion } from "framer-motion";
import { Star, Award, ExternalLink, Zap, BadgeCheck, Truck, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface SponsoredListing {
  id: string;
  partName: string;
  partNumber: string;
  vendorName: string;
  vendorLogo?: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  freeShipping: boolean;
  sameDay?: boolean;
  localPickup?: boolean;
  imageUrl?: string;
  sponsorTier: 'premium' | 'featured' | 'standard';
  highlights?: string[];
}

interface SponsoredListingsProps {
  listings?: SponsoredListing[];
  searchQuery?: string;
}

const mockListings: SponsoredListing[] = [
  {
    id: "sp-1",
    partName: "Ceramic Brake Pad Set - Premium Performance",
    partNumber: "CBP-4872-FR",
    vendorName: "AutoZone",
    price: 79.99,
    originalPrice: 99.99,
    rating: 4.8,
    reviewCount: 2847,
    inStock: true,
    freeShipping: true,
    sameDay: true,
    localPickup: true,
    sponsorTier: 'premium',
    highlights: ["OEM Quality", "Lifetime Warranty", "Low Dust Formula"],
  },
  {
    id: "sp-2",
    partName: "Performance Air Filter - Cold Air Intake",
    partNumber: "KN-33-2304",
    vendorName: "K&N",
    price: 59.99,
    rating: 4.9,
    reviewCount: 15234,
    inStock: true,
    freeShipping: true,
    sponsorTier: 'featured',
    highlights: ["Million Mile Warranty", "+10 HP Gain"],
  },
  {
    id: "sp-3",
    partName: "Full Synthetic Motor Oil 5W-30 (5 Qt)",
    partNumber: "MOB-124-5QT",
    vendorName: "Mobil 1",
    price: 32.99,
    originalPrice: 38.99,
    rating: 4.7,
    reviewCount: 8932,
    inStock: true,
    freeShipping: false,
    localPickup: true,
    sponsorTier: 'standard',
    highlights: ["Extended Protection"],
  },
];

export default function SponsoredListings({ listings = mockListings, searchQuery }: SponsoredListingsProps) {
  const getTierBadge = (tier: SponsoredListing['sponsorTier']) => {
    switch (tier) {
      case 'premium':
        return (
          <Badge className="bg-gradient-to-r from-yellow-500 to-amber-600 text-black border-0 gap-1">
            <Award className="w-3 h-3" /> Premium
          </Badge>
        );
      case 'featured':
        return (
          <Badge className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white border-0 gap-1">
            <Zap className="w-3 h-3" /> Featured
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="gap-1">
            <BadgeCheck className="w-3 h-3" /> Sponsored
          </Badge>
        );
    }
  };

  const getTierGlow = (tier: SponsoredListing['sponsorTier']) => {
    switch (tier) {
      case 'premium': return 'shadow-lg shadow-yellow-500/20 border-yellow-500/30';
      case 'featured': return 'shadow-md shadow-purple-500/15 border-purple-500/30';
      default: return 'border-border/40';
    }
  };

  if (listings.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-tech text-sm uppercase text-muted-foreground tracking-wider">
          {searchQuery ? `Top Results for "${searchQuery}"` : 'Recommended Parts'}
        </h3>
        <span className="text-xs text-muted-foreground/60">Sponsored</span>
      </div>

      <div className="grid gap-4">
        {listings.map((listing, index) => (
          <motion.div
            key={listing.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card 
              className={`bg-card overflow-hidden transition-all hover:bg-muted/20 ${getTierGlow(listing.sponsorTier)}`}
              data-testid={`sponsored-listing-${listing.id}`}
            >
              <div className="p-4">
                <div className="flex gap-4">
                  {/* Image placeholder */}
                  <div className="w-24 h-24 bg-muted/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <div className="text-3xl opacity-50">🔧</div>
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {getTierBadge(listing.sponsorTier)}
                        <span className="text-xs text-muted-foreground">{listing.vendorName}</span>
                      </div>
                    </div>

                    {/* Title & Part Number */}
                    <h4 className="font-medium text-sm line-clamp-2 mb-1">
                      {listing.partName}
                    </h4>
                    <p className="text-xs text-muted-foreground mb-2">
                      Part #: {listing.partNumber}
                    </p>

                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{listing.rating}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        ({listing.reviewCount.toLocaleString()} reviews)
                      </span>
                    </div>

                    {/* Highlights */}
                    {listing.highlights && listing.highlights.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {listing.highlights.map((h, i) => (
                          <Badge key={i} variant="outline" className="text-xs py-0 px-1.5 bg-primary/5">
                            {h}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Delivery Options */}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {listing.freeShipping && (
                        <span className="flex items-center gap-1 text-green-400">
                          <Truck className="w-3 h-3" /> Free Shipping
                        </span>
                      )}
                      {listing.sameDay && (
                        <span className="flex items-center gap-1 text-primary">
                          <Zap className="w-3 h-3" /> Same Day
                        </span>
                      )}
                      {listing.localPickup && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Pickup Available
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Price & Actions */}
                  <div className="flex flex-col items-end justify-between min-w-[100px]">
                    <div className="text-right">
                      <div className="font-tech text-xl text-primary">
                        ${listing.price.toFixed(2)}
                      </div>
                      {listing.originalPrice && (
                        <div className="text-xs text-muted-foreground line-through">
                          ${listing.originalPrice.toFixed(2)}
                        </div>
                      )}
                      {listing.originalPrice && (
                        <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs mt-1">
                          Save ${(listing.originalPrice - listing.price).toFixed(2)}
                        </Badge>
                      )}
                    </div>

                    {listing.inStock ? (
                      <Button 
                        size="sm" 
                        className="font-tech uppercase gap-1 mt-2"
                        data-testid={`add-to-cart-${listing.id}`}
                      >
                        Add to Cart
                      </Button>
                    ) : (
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="font-tech uppercase gap-1 mt-2 opacity-60"
                        disabled
                        data-testid={`out-of-stock-${listing.id}`}
                      >
                        Out of Stock
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function SponsoredBanner({ vendor, deal, link }: { vendor: string; deal: string; link?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-primary/20 via-primary/10 to-transparent border border-primary/30 rounded-lg p-3 flex items-center justify-between"
    >
      <div className="flex items-center gap-3">
        <Award className="w-5 h-5 text-primary" />
        <div>
          <p className="text-sm font-medium">{vendor}</p>
          <p className="text-xs text-muted-foreground">{deal}</p>
        </div>
      </div>
      {link && (
        <Button variant="ghost" size="sm" className="gap-1 text-primary">
          Shop Now <ExternalLink className="w-3 h-3" />
        </Button>
      )}
    </motion.div>
  );
}
