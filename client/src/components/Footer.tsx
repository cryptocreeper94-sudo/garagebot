import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Wrench, Shield, Mail, Twitter, Github, Linkedin, 
  TrendingUp, FileText, Users, Phone, MapPin, Heart, Terminal
} from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card/50 border-t border-border/40 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary/10 border border-primary/50 rounded-sm flex items-center justify-center">
                <Wrench className="w-5 h-5 text-primary" />
              </div>
              <span className="font-tech font-bold text-xl tracking-wide uppercase">
                Garage<span className="text-primary">Bot</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Right Part. First Time. Every Engine. The ultimate parts aggregator for cars, trucks, boats, ATVs, motorcycles, RVs, and everything with an engine.
            </p>
            <Badge className="bg-secondary/20 text-secondary border-secondary/30">
              <Shield className="w-3 h-3 mr-1" /> Genesis Hallmark Enabled
            </Badge>
          </div>

          <div>
            <h4 className="font-tech uppercase text-sm text-primary mb-4">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/garage" className="text-muted-foreground hover:text-primary transition-colors">
                  My Garage
                </Link>
              </li>
              <li>
                <Link href="/insurance" className="text-muted-foreground hover:text-primary transition-colors">
                  Insurance Comparison
                </Link>
              </li>
              <li>
                <Link href="/shop-portal" className="text-muted-foreground hover:text-primary transition-colors">
                  Shop Portal
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-muted-foreground hover:text-primary transition-colors">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-tech uppercase text-sm text-primary mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                  <FileText className="w-3 h-3 inline mr-1" /> Privacy Policy
                </Link>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <FileText className="w-3 h-3 inline mr-1" /> Terms of Service
                </a>
              </li>
              <li>
                <a href="mailto:support@garagebot.io" className="text-muted-foreground hover:text-primary transition-colors">
                  <Mail className="w-3 h-3 inline mr-1" /> Contact Support
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-tech uppercase text-sm text-primary mb-4">Investors</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Interested in the future of automotive technology? We're building the next generation of vehicle ownership.
            </p>
            <Link href="/investors">
              <Button 
                className="w-full font-tech uppercase gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500"
                data-testid="button-investors"
              >
                <TrendingUp className="w-4 h-4" />
                Investor Information
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-border/40 gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>© {currentYear}</span>
            <span className="font-bold text-foreground">DarkWave Studios LLC</span>
            <span>• All rights reserved</span>
          </div>
          
          <div className="flex items-center gap-4">
            <a href="https://twitter.com/garagebot" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="https://github.com/darkwave-studios" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
              <Github className="w-5 h-5" />
            </a>
            <a href="https://linkedin.com/company/garagebot" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
              <Linkedin className="w-5 h-5" />
            </a>
          </div>

          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            Made with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> in the USA
          </div>

          <Link href="/dev">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary text-xs gap-1">
              <Terminal className="w-3 h-3" /> Dev Portal
            </Button>
          </Link>
        </div>
      </div>
    </footer>
  );
}
