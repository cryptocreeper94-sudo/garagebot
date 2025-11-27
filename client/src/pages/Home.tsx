import Nav from "@/components/Nav";
import SearchHero from "@/components/SearchHero";
import CategoryGrid from "@/components/CategoryGrid";
import { ShieldCheck, Truck, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-white">
      <Nav />
      <main>
        <SearchHero />
        
        {/* Value Props Section */}
        <section className="py-12 border-y border-border bg-card/30">
          <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center gap-4 p-4 rounded-lg border border-transparent hover:border-primary/20 transition-colors bg-gradient-to-br from-white/5 to-transparent">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-tech font-bold text-lg uppercase">Instant Aggregation</h3>
                <p className="text-sm text-muted-foreground">Real-time pricing from 15+ major auto parts retailers.</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-lg border border-transparent hover:border-primary/20 transition-colors bg-gradient-to-br from-white/5 to-transparent">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-tech font-bold text-lg uppercase">Fitment Guaranteed</h3>
                <p className="text-sm text-muted-foreground">Verified compatibility checks for your specific VIN.</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-lg border border-transparent hover:border-primary/20 transition-colors bg-gradient-to-br from-white/5 to-transparent">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-tech font-bold text-lg uppercase">Shipping Comparison</h3>
                <p className="text-sm text-muted-foreground">We calculate shipping costs to find the true lowest price.</p>
              </div>
            </div>
          </div>
        </section>

        <CategoryGrid />
      </main>
      
      <footer className="py-10 border-t border-border mt-20 bg-black">
        <div className="container mx-auto px-4 text-center">
          <p className="font-mono text-sm text-muted-foreground">
            © 2024 PARTSCOUT AGGREGATOR SYSTEMS. ALL RIGHTS RESERVED.
          </p>
        </div>
      </footer>
    </div>
  );
}
