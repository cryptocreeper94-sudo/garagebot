import { useState, useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Timer, ExternalLink, Zap, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";

type Deal = {
  id: string;
  title: string;
  description: string;
  price: string;
  originalPrice: string;
  discount: string;
  vendor: string;
  vendorUrl?: string;
  searchQuery?: string;
  imageUrl: string | null;
  expiresAt: string;
  isActive: boolean;
};

const RETAILER_URLS: Record<string, string> = {
  "AutoZone": "https://www.autozone.com/searchresult?searchText=",
  "O'Reilly": "https://www.oreillyauto.com/search?q=",
  "Advance": "https://shop.advanceautoparts.com/web/SearchResults?searchTerm=",
  "RockAuto": "https://www.rockauto.com/en/catalog/?a=",
  "NAPA": "https://www.napaonline.com/search/",
  "Amazon": "https://www.amazon.com/s?k=",
};

const FALLBACK_DEALS: Deal[] = [
  {
    id: "1",
    title: "Mobil 1 Advanced Full Synthetic",
    description: "5W-30 Motor Oil, 5 Quart",
    price: "29.99",
    originalPrice: "39.99",
    discount: "25% OFF",
    imageUrl: "/generated_images/product_motor_oil.png",
    vendor: "AutoZone",
    vendorUrl: RETAILER_URLS["AutoZone"],
    searchQuery: "mobil+1+5w30+synthetic+oil",
    expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    isActive: true
  },
  {
    id: "2",
    title: "Duralast Gold Brake Pads",
    description: "Ceramic Front Brake Pads",
    price: "54.99",
    originalPrice: "64.99",
    discount: "15% OFF",
    imageUrl: "/generated_images/product_brake_pads.png",
    vendor: "O'Reilly",
    vendorUrl: RETAILER_URLS["O'Reilly"],
    searchQuery: "duralast+gold+brake+pads",
    expiresAt: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
    isActive: true
  },
  {
    id: "3",
    title: "DieHard Platinum AGM Battery",
    description: "Group Size H6, 760 CCA",
    price: "219.99",
    originalPrice: "249.99",
    discount: "$30 OFF",
    imageUrl: "/generated_images/car_battery.png",
    vendor: "Advance",
    vendorUrl: RETAILER_URLS["Advance"],
    searchQuery: "diehard+platinum+agm+battery",
    expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
    isActive: true
  },
  {
    id: "4",
    title: "K&N High Performance Air Filter",
    description: "Washable and Reusable",
    price: "49.99",
    originalPrice: "59.99",
    discount: "$10 OFF",
    imageUrl: "/generated_images/product_air_filter.png",
    vendor: "Amazon",
    vendorUrl: RETAILER_URLS["Amazon"],
    searchQuery: "K%26N+high+performance+air+filter",
    expiresAt: new Date(Date.now() + 28 * 60 * 60 * 1000).toISOString(),
    isActive: true
  }
];

async function fetchDeals(): Promise<Deal[]> {
  const res = await fetch("/api/deals");
  if (!res.ok) throw new Error("Failed to fetch deals");
  return res.json();
}

export default function FeaturedCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start", loop: true, dragFree: true });
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const { data: deals = FALLBACK_DEALS } = useQuery({
    queryKey: ["deals"],
    queryFn: fetchDeals,
  });

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  const getDealUrl = (deal: Deal): string => {
    if (deal.vendorUrl && deal.searchQuery) {
      return `${deal.vendorUrl}${deal.searchQuery}`;
    }
    const baseUrl = RETAILER_URLS[deal.vendor] || RETAILER_URLS["Amazon"];
    const searchTerm = encodeURIComponent(deal.title.replace(/\s+/g, '+'));
    return `${baseUrl}${searchTerm}`;
  };

  return (
    <section className="w-full py-4">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400 animate-pulse" />
          <h2 className="text-sm font-tech font-bold uppercase tracking-wide">
            Flash <span className="text-primary">Deals</span>
          </h2>
          <Badge variant="outline" className="text-[8px] border-primary/30 text-primary/70 ml-1">
            <Sparkles className="w-2 h-2 mr-1" />
            SAMPLE
          </Badge>
        </div>
        <span className="text-[9px] font-mono text-muted-foreground">
          Live deals coming soon
        </span>
      </div>

      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-2">
          {deals.map((deal) => {
            const timeLeft = formatDistanceToNow(new Date(deal.expiresAt), { addSuffix: false });
            const dealUrl = getDealUrl(deal);
            return (
              <div className="flex-[0_0_55%] min-w-0 sm:flex-[0_0_32%] md:flex-[0_0_24%] lg:flex-[0_0_18%]" key={deal.id}>
                <a
                  href={dealUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block h-full"
                  data-testid={`link-deal-${deal.id}`}
                >
                  <Card className="h-full bg-card/50 border-white/10 backdrop-blur-sm overflow-hidden group hover:border-primary/50 transition-all relative cursor-pointer">
                    <div className="h-20 w-full relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10" />
                      <img
                        src={deal.imageUrl || "/generated_images/product_motor_oil.png"}
                        alt={deal.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-70"
                      />
                      <Badge className="absolute top-1.5 right-1.5 z-20 bg-primary text-black font-bold font-mono text-[8px] px-1.5 py-0.5">
                        {deal.discount}
                      </Badge>
                      <div className="absolute bottom-1 left-1.5 z-20 flex items-center gap-1 text-[8px] font-mono text-yellow-400">
                        <Timer className="w-2.5 h-2.5" />
                        <span>{timeLeft}</span>
                      </div>
                    </div>

                    <div className="p-2">
                      <h3 className="font-bold text-[10px] line-clamp-1 group-hover:text-primary transition-colors">{deal.title}</h3>
                      <p className="text-[8px] text-muted-foreground line-clamp-1 mb-1">{deal.description}</p>

                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="font-mono font-bold text-xs text-white">${deal.price}</span>
                            <span className="text-[8px] text-muted-foreground line-through">${deal.originalPrice}</span>
                          </div>
                          <p className="text-[7px] text-muted-foreground uppercase font-mono">{deal.vendor}</p>
                        </div>
                        <div className="h-6 w-6 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-colors">
                          <ExternalLink className="w-3 h-3 text-primary group-hover:text-black" />
                        </div>
                      </div>
                    </div>
                  </Card>
                </a>
              </div>
            );
          })}
        </div>
      </div>

      {scrollSnaps.length > 1 && (
        <div className="flex items-center justify-center gap-3 mt-3" data-testid="deals-carousel-controls">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => emblaApi?.scrollPrev()}
            disabled={!canScrollPrev}
            className={`w-8 h-8 rounded-full bg-background/80 border border-primary/30 hover:bg-primary/10 hover:border-primary transition-all ${!canScrollPrev ? 'opacity-30' : 'opacity-100'}`}
            data-testid="deals-carousel-left"
          >
            <ChevronLeft className="w-4 h-4 text-primary" />
          </Button>

          <div className="flex items-center gap-1.5" data-testid="deals-carousel-dots">
            {scrollSnaps.map((_, i) => (
              <button
                key={i}
                onClick={() => emblaApi?.scrollTo(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === selectedIndex
                    ? 'w-6 h-2 bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.6)]'
                    : 'w-2 h-2 bg-cyan-400/30 hover:bg-cyan-400/50'
                }`}
                data-testid={`deals-dot-${i}`}
              />
            ))}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => emblaApi?.scrollNext()}
            disabled={!canScrollNext}
            className={`w-8 h-8 rounded-full bg-background/80 border border-primary/30 hover:bg-primary/10 hover:border-primary transition-all ${!canScrollNext ? 'opacity-30' : 'opacity-100'}`}
            data-testid="deals-carousel-right"
          >
            <ChevronRight className="w-4 h-4 text-primary" />
          </Button>
        </div>
      )}
    </section>
  );
}
