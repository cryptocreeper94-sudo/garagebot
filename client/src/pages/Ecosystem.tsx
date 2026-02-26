import { useEffect, useRef } from "react";
import { Link } from "wouter";
import { ArrowLeft, Shield, Globe, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function Ecosystem() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    containerRef.current.innerHTML = '<div id="dw-ecosystem-directory"></div>';

    const existingScript = document.querySelector('script[src="https://dwsc.io/api/ecosystem/directory.js"]');
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement("script");
    script.src = "https://dwsc.io/api/ecosystem/directory.js";
    script.setAttribute("data-theme", "dark");
    script.async = true;
    containerRef.current.appendChild(script);

    return () => {
      const s = document.querySelector('script[src="https://dwsc.io/api/ecosystem/directory.js"]');
      if (s) s.remove();
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-4" data-testid="link-back-home">
            <ArrowLeft className="w-4 h-4" />
            Back to GarageBot
          </Link>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 flex items-center justify-center">
              <Shield className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-2xl font-tech uppercase tracking-wider" data-testid="text-ecosystem-title">
                <span className="text-cyan-400">Trust Layer</span>{" "}
                <span className="text-muted-foreground">Ecosystem</span>
              </h1>
              <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest">
                Powered by DarkWave Studios
              </p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground max-w-2xl mt-3" data-testid="text-ecosystem-description">
            GarageBot is part of the Trust Layer ecosystem — a network of apps built on verified identity, shared credentials, and blockchain-backed trust. Your single login works across every connected platform.
          </p>
        </div>

        <Card className="bg-card/50 border-primary/20 p-6 mb-8" data-testid="ecosystem-directory-container">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-tech uppercase text-primary tracking-wide">Connected Apps</h2>
          </div>
          <div ref={containerRef} className="min-h-[200px]" />
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card className="bg-card/30 border-white/5 p-4" data-testid="card-feature-sso">
            <Shield className="w-5 h-5 text-cyan-400 mb-2" />
            <h3 className="text-sm font-tech uppercase mb-1">Single Sign-On</h3>
            <p className="text-xs text-muted-foreground">One set of credentials across all DarkWave apps. No redirects — each app has its own login, synced behind the scenes.</p>
          </Card>
          <Card className="bg-card/30 border-white/5 p-4" data-testid="card-feature-blockchain">
            <div className="w-5 h-5 text-purple-400 mb-2 font-bold text-sm flex items-center justify-center">S</div>
            <h3 className="text-sm font-tech uppercase mb-1">Blockchain Verified</h3>
            <p className="text-xs text-muted-foreground">Identity and credentials anchored on Solana. Tamper-proof verification for shops, vehicles, and hallmarks.</p>
          </Card>
          <Card className="bg-card/30 border-white/5 p-4" data-testid="card-feature-api">
            <div className="w-5 h-5 text-emerald-400 mb-2 font-bold text-sm flex items-center justify-center">{ }</div>
            <h3 className="text-sm font-tech uppercase mb-1">Open API</h3>
            <p className="text-xs text-muted-foreground">Ecosystem API v1 lets connected apps share equipment, maintenance data, and alerts securely via JWT.</p>
          </Card>
        </div>

        <div className="text-center text-xs text-muted-foreground/50">
          <a href="https://dwsc.io" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-primary transition-colors" data-testid="link-dwsc">
            dwsc.io <ExternalLink className="w-3 h-3" />
          </a>
          {" "}&bull;{" "}
          <a href="https://tlid.io" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-primary transition-colors" data-testid="link-tlid">
            tlid.io <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
