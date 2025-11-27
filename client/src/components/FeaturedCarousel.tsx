import useEmblaCarousel from "embla-carousel-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Timer, Star, ChevronRight, Zap } from "lucide-react";
import { Link } from "wouter";

const DEALS = [
  {
    id: 1,
    title: "Mobil 1 Advanced Full Synthetic",
    description: "5W-30 Motor Oil, 5 Quart",
    price: "$29.99",
    originalPrice: "$39.99",
    discount: "25% OFF",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1635784063748-252802c6c25c?q=80&w=600&auto=format&fit=crop",
    vendor: "AutoZone",
    expires: "2h 15m"
  },
  {
    id: 2,
    title: "Duralast Gold Brake Pads",
    description: "Ceramic Front Brake Pads",
    price: "$54.99",
    originalPrice: "$64.99",
    discount: "15% OFF",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=600&auto=format&fit=crop",
    vendor: "O'Reilly",
    expires: "5h 30m"
  },
  {
    id: 3,
    title: "DieHard Platinum AGM Battery",
    description: "Group Size H6, 760 CCA",
    price: "$219.99",
    originalPrice: "$249.99",
    discount: "$30 OFF",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?q=80&w=600&auto=format&fit=crop",
    vendor: "Advance",
    expires: "12h 00m"
  },
  {
    id: 4,
    title: "K&N High Performance Air Filter",
    description: "Washable and Reusable",
    price: "$49.99",
    originalPrice: "$59.99",
    discount: "$10 OFF",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?q=80&w=600&auto=format&fit=crop",
    vendor: "AutoZone",
    expires: "1d 4h"
  }
];

export default function FeaturedCarousel() {
  const [emblaRef] = useEmblaCarousel({ align: "start", loop: true });

  return (
    <section className="w-full py-6">
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400 fill-yellow-400 animate-pulse" />
          <h2 className="text-xl font-tech font-bold uppercase tracking-wide">
            Flash <span className="text-primary">Deals</span>
          </h2>
        </div>
        <Button variant="link" className="text-[10px] font-mono text-muted-foreground hover:text-primary h-auto p-0">
          VIEW ALL OFFERS
        </Button>
      </div>

      <div className="overflow-hidden -mx-4 px-4" ref={emblaRef}>
        <div className="flex gap-4">
          {DEALS.map((deal) => (
            <div className="flex-[0_0_85%] min-w-0 sm:flex-[0_0_45%] md:flex-[0_0_40%]" key={deal.id}>
              <Card className="h-full bg-card/50 border-white/10 backdrop-blur-sm overflow-hidden group hover:border-primary/50 transition-all relative">
                {/* Image Background Area */}
                <div className="h-32 w-full relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10" />
                  <img 
                    src={deal.image} 
                    alt={deal.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-70"
                  />
                  <Badge className="absolute top-3 right-3 z-20 bg-primary text-black font-bold font-mono text-[10px]">
                    {deal.discount}
                  </Badge>
                  <div className="absolute bottom-2 left-3 z-20 flex items-center gap-1 text-[10px] font-mono text-yellow-400">
                    <Timer className="w-3 h-3" />
                    <span>ENDS IN {deal.expires}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-sm line-clamp-1 group-hover:text-primary transition-colors">{deal.title}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-1">{deal.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-lg text-white">{deal.price}</span>
                        <span className="text-xs text-muted-foreground line-through decoration-red-500/50">{deal.originalPrice}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground uppercase font-mono">Sold by {deal.vendor}</p>
                    </div>
                    <Button size="sm" className="h-8 w-8 p-0 rounded-full bg-primary text-black hover:bg-white transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
