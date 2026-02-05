import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { 
  ExternalLink, Star, TrendingUp, Wrench, Shield, Zap,
  ChevronRight, Tag
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ProductRec {
  id: string;
  title: string;
  brand: string;
  description: string;
  image?: string;
  price?: string;
  originalPrice?: string;
  rating?: number;
  reviewCount?: number;
  affiliateUrl: string;
  tag?: string;
  category: string;
}

interface NativeProductRecsProps {
  context?: string;
  category?: string;
  vehicleType?: string;
  maxItems?: number;
  layout?: "horizontal" | "grid" | "inline";
  title?: string;
}

const CONTEXTUAL_PRODUCTS: Record<string, ProductRec[]> = {
  tools: [
    { id: "t1", title: "Professional Mechanic Tool Set - 230pc", brand: "DEWALT", description: "Chrome vanadium steel, lifetime warranty", price: "$199.99", originalPrice: "$279.99", rating: 4.8, reviewCount: 2340, affiliateUrl: "#", tag: "Best Seller", category: "tools" },
    { id: "t2", title: "Digital Torque Wrench 1/2\" Drive", brand: "GEARWRENCH", description: "Electronic torque & angle, buzzer alert", price: "$89.99", rating: 4.7, reviewCount: 1120, affiliateUrl: "#", category: "tools" },
    { id: "t3", title: "OBD2 Scanner - Full System Diagnostic", brand: "FOXWELL", description: "ABS, SRS, transmission, engine codes", price: "$59.99", originalPrice: "$89.99", rating: 4.6, reviewCount: 3450, affiliateUrl: "#", tag: "Top Pick", category: "tools" },
    { id: "t4", title: "3-Ton Low Profile Floor Jack", brand: "PITTSBURGH", description: "Quick lift, rapid pump, safety valve", price: "$129.99", rating: 4.5, reviewCount: 890, affiliateUrl: "#", category: "tools" },
  ],
  safety: [
    { id: "s1", title: "Mechanic Work Gloves - Cut Resistant", brand: "MECHANIX", description: "Impact protection, touchscreen capable", price: "$24.99", rating: 4.9, reviewCount: 5670, affiliateUrl: "#", tag: "Most Popular", category: "safety" },
    { id: "s2", title: "Safety Glasses - Anti-Fog", brand: "3M", description: "ANSI Z87.1 rated, UV protection", price: "$12.99", rating: 4.7, reviewCount: 8900, affiliateUrl: "#", category: "safety" },
    { id: "s3", title: "Mechanics Creeper - Padded", brand: "TORIN", description: "6 casters, 350lb capacity, headrest", price: "$44.99", originalPrice: "$59.99", rating: 4.6, reviewCount: 1230, affiliateUrl: "#", category: "safety" },
  ],
  garage: [
    { id: "g1", title: "5-Shelf Steel Garage Storage", brand: "HUSKY", description: "Heavy duty, 4000lb capacity, adjustable", price: "$89.99", rating: 4.7, reviewCount: 3400, affiliateUrl: "#", tag: "Best Value", category: "garage" },
    { id: "g2", title: "LED Shop Light 4ft - 5000K Daylight", brand: "LITHONIA", description: "10,000 lumens, linkable, pull chain", price: "$34.99", rating: 4.8, reviewCount: 6700, affiliateUrl: "#", category: "garage" },
    { id: "g3", title: "Rolling Tool Cabinet - 15 Drawer", brand: "CRAFTSMAN", description: "Ball-bearing slides, power strip, keyed lock", price: "$449.99", originalPrice: "$599.99", rating: 4.9, reviewCount: 2100, affiliateUrl: "#", tag: "Pro Choice", category: "garage" },
  ],
  outdoor: [
    { id: "o1", title: "Portable Jump Starter 2000A Peak", brand: "NOCO", description: "Gas & diesel engines, USB power bank", price: "$99.99", rating: 4.8, reviewCount: 12000, affiliateUrl: "#", tag: "Essential", category: "outdoor" },
    { id: "o2", title: "12V Tire Inflator - Digital", brand: "VIAIR", description: "150 PSI, auto shutoff, LED light", price: "$49.99", rating: 4.6, reviewCount: 4500, affiliateUrl: "#", category: "outdoor" },
    { id: "o3", title: "Roadside Emergency Kit - 123pc", brand: "AAA", description: "First aid, jumper cables, flashlight, tools", price: "$39.99", rating: 4.7, reviewCount: 3200, affiliateUrl: "#", category: "outdoor" },
  ],
  marine: [
    { id: "m1", title: "Marine Battery Charger - 3 Bank", brand: "MINN KOTA", description: "Onboard charger, auto sensing, waterproof", price: "$219.99", rating: 4.7, reviewCount: 890, affiliateUrl: "#", tag: "Top Rated", category: "marine" },
    { id: "m2", title: "Boat Trailer Guide-On - 60\"", brand: "CE SMITH", description: "Galvanized steel, carpet pads, adjustable", price: "$79.99", rating: 4.5, reviewCount: 560, affiliateUrl: "#", category: "marine" },
  ],
  aviation: [
    { id: "a1", title: "Aviation Headset - Active Noise Cancelling", brand: "DAVID CLARK", description: "ANR, Bluetooth, comfort gel ear seals", price: "$795.00", rating: 4.9, reviewCount: 2340, affiliateUrl: "#", tag: "Pilot Favorite", category: "aviation" },
    { id: "a2", title: "Aircraft Engine Oil - Aeroshell W100", brand: "SHELL", description: "Single grade, ashless dispersant", price: "$12.49", rating: 4.8, reviewCount: 670, affiliateUrl: "#", category: "aviation" },
    { id: "a3", title: "Portable Aviation GPS", brand: "GARMIN", description: "Aera 760, touchscreen, weather, terrain", price: "$1,649.00", rating: 4.7, reviewCount: 340, affiliateUrl: "#", tag: "Pro Pick", category: "aviation" },
  ],
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-3 h-3 ${
            star <= rating ? "text-yellow-400 fill-yellow-400" : "text-zinc-600"
          }`}
        />
      ))}
    </div>
  );
}

export default function NativeProductRecs({ 
  context, 
  category,
  vehicleType,
  maxItems = 4, 
  layout = "horizontal",
  title
}: NativeProductRecsProps) {
  let selectedCategory = category || "tools";
  if (vehicleType === "boats" || vehicleType === "marine") selectedCategory = "marine";
  if (vehicleType === "aviation") selectedCategory = "aviation";
  if (context === "diy" || context === "repair") selectedCategory = "tools";
  if (context === "safety") selectedCategory = "safety";
  if (context === "garage") selectedCategory = "garage";
  if (context === "outdoor") selectedCategory = "outdoor";

  const { data: managedAds } = useQuery<ProductRec[]>({
    queryKey: ["/api/ads/native", selectedCategory, vehicleType],
    queryFn: async () => {
      const params = new URLSearchParams({ category: selectedCategory });
      if (vehicleType) params.set("vehicleType", vehicleType);
      const res = await fetch(`/api/ads/native?${params}`);
      if (!res.ok) return [];
      return res.json();
    },
  });

  const staticProducts = CONTEXTUAL_PRODUCTS[selectedCategory] || CONTEXTUAL_PRODUCTS.tools;
  const products = managedAds && managedAds.length > 0 ? managedAds : staticProducts;
  const displayProducts = products.slice(0, maxItems);

  const sectionTitle = title || (() => {
    switch (selectedCategory) {
      case "tools": return "Top Tools for This Job";
      case "safety": return "Recommended Safety Gear";
      case "garage": return "Upgrade Your Workspace";
      case "outdoor": return "Road Trip Essentials";
      case "marine": return "Marine Gear Picks";
      case "aviation": return "Aviation Essentials";
      default: return "Recommended Gear";
    }
  })();

  if (layout === "inline") {
    return (
      <div className="my-4" data-testid="native-recs-inline">
        <div className="flex items-center gap-2 mb-3">
          <Wrench className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">{sectionTitle}</span>
          <span className="text-[10px] text-muted-foreground ml-auto">Sponsored</span>
        </div>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
          {displayProducts.map((product) => (
            <a
              key={product.id}
              href={product.affiliateUrl}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="flex-shrink-0 w-[200px] group"
              data-testid={`native-rec-${product.id}`}
            >
              <Card className="p-3 h-full bg-card/50 border-border hover:border-primary/30 transition-all">
                <p className="text-xs font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
                  {product.title}
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">{product.brand}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-bold text-primary">{product.price}</span>
                  <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Card>
            </a>
          ))}
        </div>
      </div>
    );
  }

  if (layout === "grid") {
    return (
      <div className="my-6" data-testid="native-recs-grid">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-tech uppercase tracking-wider text-foreground">{sectionTitle}</h3>
          </div>
          <span className="text-[10px] text-muted-foreground">Sponsored</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {displayProducts.map((product, index) => (
            <motion.a
              key={product.id}
              href={product.affiliateUrl}
              target="_blank"
              rel="noopener noreferrer sponsored"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group"
              data-testid={`native-rec-${product.id}`}
            >
              <Card className="p-4 h-full bg-card/50 border-border hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all">
                {product.tag && (
                  <Badge className="mb-2 bg-primary/10 text-primary border-primary/30 text-[10px]">
                    <Tag className="w-2.5 h-2.5 mr-1" />
                    {product.tag}
                  </Badge>
                )}
                <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
                  {product.title}
                </p>
                <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">{product.brand}</p>
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{product.description}</p>
                <div className="mt-3 flex items-center gap-2">
                  {product.rating && <StarRating rating={product.rating} />}
                  {product.reviewCount && (
                    <span className="text-[10px] text-muted-foreground">({product.reviewCount.toLocaleString()})</span>
                  )}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-lg font-bold text-primary">{product.price}</span>
                  {product.originalPrice && (
                    <span className="text-xs text-muted-foreground line-through">{product.originalPrice}</span>
                  )}
                </div>
                <div className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>View Deal</span>
                  <ExternalLink className="w-3 h-3" />
                </div>
              </Card>
            </motion.a>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="my-6" data-testid="native-recs-horizontal">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-tech uppercase tracking-wider text-foreground">{sectionTitle}</h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-muted-foreground">Sponsored</span>
          <a href="#" className="text-[10px] text-primary hover:underline flex items-center gap-1">
            See All <ChevronRight className="w-3 h-3" />
          </a>
        </div>
      </div>
      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
        {displayProducts.map((product, index) => (
          <motion.a
            key={product.id}
            href={product.affiliateUrl}
            target="_blank"
            rel="noopener noreferrer sponsored"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex-shrink-0 w-[240px] group"
            data-testid={`native-rec-${product.id}`}
          >
            <Card className="p-4 h-full bg-card/50 border-border hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all">
              {product.tag && (
                <Badge className="mb-2 bg-primary/10 text-primary border-primary/30 text-[10px]">
                  {product.tag}
                </Badge>
              )}
              <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
                {product.title}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">{product.brand}</p>
              <p className="text-xs text-muted-foreground mt-2 line-clamp-1">{product.description}</p>
              <div className="mt-3 flex items-center gap-2">
                {product.rating && <StarRating rating={product.rating} />}
                {product.reviewCount && (
                  <span className="text-[10px] text-muted-foreground">({product.reviewCount.toLocaleString()})</span>
                )}
              </div>
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-primary">{product.price}</span>
                  {product.originalPrice && (
                    <span className="text-xs text-muted-foreground line-through">{product.originalPrice}</span>
                  )}
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Card>
          </motion.a>
        ))}
      </div>
    </div>
  );
}
