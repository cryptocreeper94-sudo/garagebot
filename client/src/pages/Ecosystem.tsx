import { useEffect, useRef } from "react";
import { Link } from "wouter";
import { ArrowLeft, Shield, Globe, ExternalLink, Fingerprint, Code2, Zap } from "lucide-react";
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
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="container mx-auto px-4 py-8 sm:py-12 max-w-5xl relative z-10">
          <div className="mb-8 sm:mb-10">
            <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6" data-testid="link-back-home">
              <ArrowLeft className="w-4 h-4" />
              Back to GarageBot
            </Link>

            <div className="flex items-start sm:items-center gap-4 mb-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/10">
                <Shield className="w-6 h-6 sm:w-7 sm:h-7 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight" data-testid="text-ecosystem-title">
                  <span className="bg-gradient-to-r from-cyan-400 to-cyan-300 bg-clip-text text-transparent">Trust Layer</span>{" "}
                  <span className="text-foreground/80">Ecosystem</span>
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Powered by DarkWave Studios
                </p>
              </div>
            </div>

            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed" data-testid="text-ecosystem-description">
              GarageBot is part of the Trust Layer ecosystem — a network of apps built on verified identity, shared credentials, and blockchain-backed trust. Your single login works across every connected platform.
            </p>
          </div>

          <Card className="bg-card/60 backdrop-blur-sm border-cyan-500/15 p-4 sm:p-6 mb-8 sm:mb-10 shadow-xl shadow-black/20" data-testid="ecosystem-directory-container">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/5">
              <Globe className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-semibold uppercase text-cyan-400 tracking-wide">Connected Apps</h2>
            </div>
            <div ref={containerRef} className="min-h-[200px]" />
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-10">
            <Card className="bg-card/40 backdrop-blur-sm border-white/5 p-4 sm:p-5 hover:border-cyan-500/20 transition-all group" data-testid="card-feature-sso">
              <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-3 group-hover:bg-cyan-500/15 transition-colors">
                <Fingerprint className="w-4 h-4 text-cyan-400" />
              </div>
              <h3 className="text-sm font-semibold mb-1.5">Single Sign-On</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">One set of credentials across all DarkWave apps. No redirects — each app has its own login, synced behind the scenes.</p>
            </Card>
            <Card className="bg-card/40 backdrop-blur-sm border-white/5 p-4 sm:p-5 hover:border-purple-500/20 transition-all group" data-testid="card-feature-blockchain">
              <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-3 group-hover:bg-purple-500/15 transition-colors">
                <Zap className="w-4 h-4 text-purple-400" />
              </div>
              <h3 className="text-sm font-semibold mb-1.5">Blockchain Verified</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">Identity and credentials anchored on Solana. Tamper-proof verification for shops, vehicles, and digital assets.</p>
            </Card>
            <Card className="bg-card/40 backdrop-blur-sm border-white/5 p-4 sm:p-5 hover:border-emerald-500/20 transition-all group" data-testid="card-feature-api">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3 group-hover:bg-emerald-500/15 transition-colors">
                <Code2 className="w-4 h-4 text-emerald-400" />
              </div>
              <h3 className="text-sm font-semibold mb-1.5">Open API</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">Ecosystem API lets connected apps share data and alerts securely via JWT-authenticated endpoints.</p>
            </Card>
          </div>

          <div className="text-center text-xs text-muted-foreground/50 pb-4">
            <a href="https://dwsc.io" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-cyan-400 transition-colors" data-testid="link-dwsc">
              dwsc.io <ExternalLink className="w-3 h-3" />
            </a>
            <span className="mx-2">&bull;</span>
            <a href="https://tlid.io" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-cyan-400 transition-colors" data-testid="link-tlid">
              tlid.io <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
