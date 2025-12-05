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
  const currentYear = new Date().getFullYear();
  
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
    <footer className="bg-card/30 border-t border-border/30 mt-auto py-3">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">© {currentYear} DarkWave Studios LLC</span>
          <span className="hidden sm:inline">•</span>
          <Link href="/garage" className="hover:text-primary transition-colors">Garage</Link>
          <Link href="/insurance" className="hover:text-primary transition-colors">Insurance</Link>
          <Link href="/shop-portal" className="hover:text-primary transition-colors">Shop Portal</Link>
          <Link href="/investors" className="hover:text-primary transition-colors">Investors</Link>
          <span className="hidden sm:inline">•</span>
          <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
          <a href="mailto:support@garagebot.io" className="hover:text-primary transition-colors">Contact</a>
          <span className="hidden sm:inline">•</span>
          <Link href="/dev" className="hover:text-primary transition-colors">Dev Portal</Link>
          {latestRelease?.version && (
            <Badge 
              variant="outline" 
              className="text-[10px] font-mono py-0 px-1.5 border-border/50"
              data-testid="badge-version"
            >
              {latestRelease.version}
            </Badge>
          )}
        </div>
      </div>
    </footer>
  );
}
