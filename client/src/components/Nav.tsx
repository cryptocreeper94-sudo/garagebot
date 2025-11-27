import { Link } from "wouter";
import { Search, User, ShoppingCart, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Nav() {
  return (
    <nav className="w-full h-16 border-b border-border/40 bg-background/80 backdrop-blur-md fixed top-0 z-50">
      <div className="container mx-auto h-full flex items-center justify-between px-4">
          <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer group">
            <div className="w-8 h-8 bg-primary/10 border border-primary/50 rounded-sm flex items-center justify-center transform group-hover:rotate-180 transition-transform duration-700">
              <Wrench className="w-5 h-5 text-primary" />
            </div>
            <span className="font-tech font-bold text-2xl tracking-wide uppercase text-foreground">
              Auto<span className="text-primary">Ledger</span>
            </span>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link href="/garage">
            <span className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors cursor-pointer">My Garage</span>
          </Link>
          <Link href="/dashboard">
            <span className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors cursor-pointer">Dashboard</span>
          </Link>
          <a href="#" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Track Order</a>
          <a href="#" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Support</a>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="hover:text-primary">
            <Search className="w-5 h-5" />
          </Button>
          <Link href="/account">
            <Button variant="ghost" size="icon" className="hover:text-primary">
              <User className="w-5 h-5" />
            </Button>
          </Link>
          <Button variant="outline" className="hidden md:flex gap-2 border-primary/50 hover:bg-primary/10 hover:text-primary hover:border-primary">
            <ShoppingCart className="w-4 h-4" />
            <span className="font-tech">Cart (0)</span>
          </Button>
        </div>
      </div>
    </nav>
  );
}
