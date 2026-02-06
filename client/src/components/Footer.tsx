import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Sparkles, Shield, Fingerprint } from "lucide-react";

interface Release {
  id: string;
  version: string;
  versionType: string;
  publishedAt: string | null;
}

const ecosystemLinks = [
  { name: "DarkWave Studios", url: "https://dwsc.io", icon: Sparkles, color: "text-purple-400" },
  { name: "Trust Layer ID", url: "https://tlid.io", icon: Fingerprint, color: "text-cyan-400" },
  { name: "TrustShield", url: "https://trustshield.tech", icon: Shield, color: "text-emerald-400" },
];

export default function Footer() {
  const { data: latestRelease } = useQuery<Release | null>({
    queryKey: ['latestRelease'],
    queryFn: async () => {
      const res = await fetch('/api/releases/latest');
      if (!res.ok) return null;
      return res.json();
    },
    staleTime: 1000 * 60 * 5,
  });

  return (
    <footer className="sticky-footer border-t border-border/30 bg-card/95 backdrop-blur-md py-2">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[10px] text-muted-foreground">
          <span className="font-medium text-foreground">© {new Date().getFullYear()} DarkWave Studios, LLC</span>
          <span className="hidden sm:inline text-border">|</span>
          {latestRelease?.version ? (
            <Badge 
              variant="outline" 
              className="text-[10px] font-mono py-0 px-1.5 border-border/50"
              data-testid="badge-version"
            >
              {latestRelease.version}
            </Badge>
          ) : (
            <span className="font-mono text-primary/80">v1.0.0</span>
          )}
          <span className="hidden sm:inline text-border">|</span>
          <Link href="/about" className="hover:text-primary transition-colors" data-testid="footer-link-about">About</Link>
          <Link href="/contact" className="hover:text-primary transition-colors" data-testid="footer-link-contact">Contact</Link>
          <Link href="/terms" className="hover:text-primary transition-colors" data-testid="footer-link-terms">Terms</Link>
          <Link href="/privacy" className="hover:text-primary transition-colors" data-testid="footer-link-privacy">Privacy</Link>
          <Link href="/affiliate-disclosure" className="hover:text-primary transition-colors" data-testid="footer-link-affiliate">Affiliates</Link>
          <Link href="/investors" className="hover:text-primary transition-colors" data-testid="footer-link-investors">Investors</Link>
          <Link href="/support" className="hover:text-primary transition-colors" data-testid="footer-link-support">Support</Link>
          <Link href="/break-room" className="hover:text-primary transition-colors" data-testid="footer-link-breakroom">Break Room</Link>
          <Link href="/vendor-signup" className="hover:text-primary transition-colors" data-testid="footer-link-vendor">Vendor Signup</Link>
          <Link href="/dev" className="hover:text-primary transition-colors" data-testid="footer-link-dev">Dev</Link>
          
          {/* Ecosystem Links */}
          <span className="hidden sm:inline text-border">|</span>
          <span className="hidden sm:inline text-[9px] text-muted-foreground/60">Ecosystem:</span>
          {ecosystemLinks.map((site) => (
            <a
              key={site.name}
              href={site.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`hidden sm:inline-flex items-center gap-0.5 hover:opacity-100 opacity-70 transition-opacity ${site.color}`}
              data-testid={`footer-ecosystem-${site.name.toLowerCase().replace(/\s/g, '-')}`}
            >
              <site.icon className="w-3 h-3" />
              <span className="text-[9px]">{site.url.replace('https://', '')}</span>
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
