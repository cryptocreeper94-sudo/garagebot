import { useState } from "react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Shield, Fingerprint, Mail, Send, CheckCircle2, Users, Gift, MessageCircle, Wrench } from "lucide-react";

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

const socialLinks = [
  { name: "Facebook", url: "https://facebook.com/GarageBot.io", icon: () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> },
  { name: "Instagram", url: "https://instagram.com/garagebot.io", icon: () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg> },
  { name: "X", url: "https://x.com/GarageBotIO", icon: () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
  { name: "YouTube", url: "https://youtube.com/@GarageBotIO", icon: () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"/><path fill="black" d="M9.545 15.568V8.432L15.818 12z"/></svg> },
  { name: "TikTok", url: "https://tiktok.com/@garagebot.io", icon: () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg> },
];

const quickLinks = [
  { label: "Invite Friends", href: "/invite", icon: Users },
  { label: "Blog & Tips", href: "/blog", icon: Gift },
  { label: "Signal Chat", href: "/chat", icon: MessageCircle },
  { label: "Shade Tree", href: "/shade-tree", icon: Wrench },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const { toast } = useToast();

  const { data: latestRelease } = useQuery<Release | null>({
    queryKey: ['latestRelease'],
    queryFn: async () => {
      const res = await fetch('/api/releases/latest');
      if (!res.ok) return null;
      return res.json();
    },
    staleTime: 1000 * 60 * 5,
  });

  const subscribeMutation = useMutation({
    mutationFn: async (emailAddr: string) => {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailAddr, source: 'footer' }),
      });
      if (!res.ok) throw new Error('Failed to subscribe');
      return res.json();
    },
    onSuccess: (data) => {
      setSubscribed(true);
      setEmail("");
      toast({ title: "Subscribed!", description: data.message });
    },
    onError: () => {
      toast({ title: "Error", description: "Something went wrong. Try again.", variant: "destructive" });
    },
  });

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({ title: "Invalid email", description: "Please enter a valid email address.", variant: "destructive" });
      return;
    }
    subscribeMutation.mutate(email);
  };

  return (
    <footer className="border-t border-border/30 bg-card/95 backdrop-blur-md">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
          <div>
            <h3 className="font-tech text-sm uppercase text-primary mb-3 flex items-center gap-2" data-testid="footer-newsletter-title">
              <Mail className="w-4 h-4" />
              Stay in the Loop
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              Get deals, DIY tips, and new feature alerts. No spam, ever.
            </p>
            {subscribed ? (
              <div className="flex items-center gap-2 text-green-400 text-sm" data-testid="footer-subscribed-msg">
                <CheckCircle2 className="w-4 h-4" />
                <span className="font-tech">You're in!</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2" data-testid="footer-newsletter-form">
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-9 bg-black/30 border-white/10 text-sm flex-1"
                  data-testid="input-newsletter-email"
                />
                <Button
                  type="submit"
                  size="sm"
                  className="h-9 bg-primary text-black hover:bg-primary/90 font-tech uppercase text-xs px-4"
                  disabled={subscribeMutation.isPending}
                  data-testid="button-newsletter-subscribe"
                >
                  {subscribeMutation.isPending ? (
                    <div className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                </Button>
              </form>
            )}
          </div>

          <div>
            <h3 className="font-tech text-sm uppercase text-primary mb-3">Engage</h3>
            <div className="grid grid-cols-2 gap-2">
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors"
                  data-testid={`footer-engage-${link.label.toLowerCase().replace(/\s/g, '-')}`}
                >
                  <link.icon className="w-3 h-3" />
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-tech text-sm uppercase text-primary mb-3">Follow Us</h3>
            <div className="flex gap-3 mb-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 hover:bg-primary/10 transition-all"
                  title={social.name}
                  data-testid={`footer-social-${social.name.toLowerCase()}`}
                >
                  <social.icon />
                </a>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {ecosystemLinks.map((site) => (
                <a
                  key={site.name}
                  href={site.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-1 text-[10px] opacity-60 hover:opacity-100 transition-opacity ${site.color}`}
                  data-testid={`footer-ecosystem-${site.name.toLowerCase().replace(/\s/g, '-')}`}
                >
                  <site.icon className="w-2.5 h-2.5" />
                  <span>{site.url.replace('https://', '')}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-border/20 pt-4">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[10px] text-muted-foreground mb-2">
            <Link href="/about" className="hover:text-primary transition-colors" data-testid="footer-link-about">About</Link>
            <Link href="/contact" className="hover:text-primary transition-colors" data-testid="footer-link-contact">Contact</Link>
            <Link href="/support" className="hover:text-primary transition-colors" data-testid="footer-link-support">Support</Link>
            <Link href="/blog" className="hover:text-primary transition-colors" data-testid="footer-link-blog">Blog</Link>
            <span className="text-border">|</span>
            <Link href="/terms" className="hover:text-primary transition-colors" data-testid="footer-link-terms">Terms</Link>
            <Link href="/privacy" className="hover:text-primary transition-colors" data-testid="footer-link-privacy">Privacy</Link>
            <Link href="/affiliate-disclosure" className="hover:text-primary transition-colors" data-testid="footer-link-affiliate">Affiliates</Link>
            <Link href="/affiliates" className="hover:text-primary transition-colors" data-testid="footer-link-affiliate-program">Affiliate Program</Link>
            <span className="text-border">|</span>
            <Link href="/investors" className="hover:text-primary transition-colors" data-testid="footer-link-investors">Investors</Link>
            <Link href="/vendor-signup" className="hover:text-primary transition-colors" data-testid="footer-link-vendor">Vendor Signup</Link>
            <Link href="/break-room" className="hover:text-primary transition-colors" data-testid="footer-link-breakroom">Break Room</Link>
            <Link href="/dev" className="hover:text-primary transition-colors" data-testid="footer-link-dev">Dev Portal</Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[9px] text-muted-foreground/70">
            <span className="font-medium text-foreground/80">&copy; {new Date().getFullYear()} DarkWave Studios, LLC</span>
            <span className="text-border/50">|</span>
            {latestRelease?.version ? (
              <Badge
                variant="outline"
                className="text-[9px] font-mono py-0 px-1.5 border-border/40"
                data-testid="badge-version"
              >
                {latestRelease.version}
              </Badge>
            ) : (
              <span className="font-mono text-primary/60">v1.0.0</span>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
