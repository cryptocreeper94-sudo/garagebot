import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";

interface Release {
  id: string;
  version: string;
  versionType: string;
  publishedAt: string | null;
}

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
          <span className="font-medium text-foreground">© 2025 DarkWave Studios, LLC</span>
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
          <Link href="/investors" className="hover:text-primary transition-colors" data-testid="footer-link-investors">Investors</Link>
          <Link href="/terms" className="hover:text-primary transition-colors" data-testid="footer-link-terms">Terms</Link>
          <Link href="/privacy" className="hover:text-primary transition-colors" data-testid="footer-link-privacy">Privacy</Link>
          <Link href="/vendor-signup" className="hover:text-primary transition-colors" data-testid="footer-link-vendor">Vendor Signup</Link>
          <Link href="/dev" className="hover:text-primary transition-colors" data-testid="footer-link-dev">Dev</Link>
        </div>
      </div>
    </footer>
  );
}
