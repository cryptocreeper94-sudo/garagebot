import { useState } from "react";
import { motion } from "framer-motion";
import { useMutation, useQuery } from "@tanstack/react-query";
import { 
  Crown, Check, Zap, Shield, Bell, Search, Car, Users, 
  MessageSquare, TrendingUp, Gift, Star, Lock, ArrowRight, Loader2,
  Sparkles, Award, Clock, ShoppingCart, Tag, Package
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const BASIC_FEATURES = [
  { icon: <Tag className="w-4 h-4" />, text: "Ad-free browsing" },
  { icon: <ShoppingCart className="w-4 h-4" />, text: "Marketplace selling" },
  { icon: <Car className="w-4 h-4" />, text: "Up to 3 saved vehicles" },
  { icon: <Search className="w-4 h-4" />, text: "Parts search & comparison" },
  { icon: <MessageSquare className="w-4 h-4" />, text: "Basic Buddy AI chat" },
  { icon: <Package className="w-4 h-4" />, text: "DIY guides + YouTube" },
];

const PRO_FEATURES = [
  { icon: <Check className="w-4 h-4" />, text: "Everything in Basic" },
  { icon: <Car className="w-4 h-4" />, text: "Unlimited vehicles" },
  { icon: <Award className="w-4 h-4" />, text: "Genesis Hallmark $1.99 (vs $9.99)" },
  { icon: <Bell className="w-4 h-4" />, text: "Price drop alerts" },
  { icon: <Sparkles className="w-4 h-4" />, text: "Advanced Buddy AI" },
  { icon: <TrendingUp className="w-4 h-4" />, text: "Saved DIY progress" },
  { icon: <Shield className="w-4 h-4" />, text: "Extended recall monitoring" },
  { icon: <Gift className="w-4 h-4" />, text: "Exclusive deals" },
  { icon: <Users className="w-4 h-4" />, text: "Family sharing (up to 10)" },
];

export default function ProSubscription() {
  const [isAnnual, setIsAnnual] = useState(false);
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  const basicMonthly = 6;
  const basicAnnual = 60;
  const proMonthly = 10;
  const proAnnual = 99;

  const basicAnnualSavings = Math.round((basicMonthly * 12 - basicAnnual) / (basicMonthly * 12) * 100);
  const proAnnualSavings = Math.round((proMonthly * 12 - proAnnual) / (proMonthly * 12) * 100);

  const { data: subscription } = useQuery({
    queryKey: ['subscription'],
    queryFn: async () => {
      const res = await fetch('/api/subscription/status');
      if (!res.ok) return null;
      return res.json();
    },
    enabled: isAuthenticated,
  });

  const subscribeMutation = useMutation({
    mutationFn: async ({ tier, billingPeriod }: { tier: string; billingPeriod: string }) => {
      const res = await fetch('/api/subscription/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier, billingPeriod }),
      });
      if (!res.ok) throw new Error('Failed to start checkout');
      return res.json();
    },
    onSuccess: (data) => {
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to start checkout. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubscribe = (tier: 'basic' | 'pro') => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to subscribe",
      });
      return;
    }
    subscribeMutation.mutate({ tier, billingPeriod: isAnnual ? 'annual' : 'monthly' });
  };

  const currentTier = subscription?.tier || 'free';
  const isBasic = currentTier === 'basic';
  const isPro = currentTier === 'pro';

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <Card className="p-4 glass-ultra border-yellow-500/30">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-tech text-yellow-500 uppercase text-sm">Founders Circle</span>
                  <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-[10px]">
                    Launch Pricing
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Lock in these prices forever. Rates increase after V2 launch.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="w-4 h-4" />
              Limited time offer
            </div>
          </div>
        </Card>
      </motion.div>

      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 mb-4">
          <Crown className="w-5 h-5 text-cyan-400" />
          <span className="font-tech text-sm uppercase text-cyan-400">Choose Your Plan</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-tech font-bold uppercase mb-3">
          Upgrade Your <span className="text-gradient">GarageBot</span>
        </h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          From marketplace selling to unlimited AI features. Pick the plan that fits your garage.
        </p>
      </div>

      <div className="flex items-center justify-center gap-4">
        <span className={`text-sm font-medium ${!isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
          Monthly
        </span>
        <Switch 
          checked={isAnnual} 
          onCheckedChange={setIsAnnual}
          className="data-[state=checked]:bg-primary"
        />
        <span className={`text-sm font-medium ${isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
          Annual
        </span>
        {isAnnual && (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            Save up to {proAnnualSavings}%
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="relative overflow-hidden border border-cyan-500/20 bg-gradient-to-b from-cyan-500/5 to-transparent h-full flex flex-col">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-500" />
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-5 h-5 text-cyan-400" />
                <h3 className="font-tech text-lg uppercase text-cyan-400">Basic</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-4">Perfect for marketplace sellers and ad-free browsing</p>

              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-bold text-foreground">
                  ${isAnnual ? basicAnnual : basicMonthly}
                </span>
                <span className="text-muted-foreground">/{isAnnual ? 'year' : 'month'}</span>
              </div>
              {isAnnual && (
                <p className="text-xs text-muted-foreground mb-4">
                  ${(basicAnnual / 12).toFixed(2)}/mo — save {basicAnnualSavings}%
                </p>
              )}
              {!isAnnual && <div className="mb-4" />}

              <div className="space-y-3 mb-6 flex-1">
                {BASIC_FEATURES.map((f, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-sm">
                    <div className="w-6 h-6 rounded-md bg-cyan-500/10 flex items-center justify-center text-cyan-400 shrink-0">
                      {f.icon}
                    </div>
                    <span className="text-slate-300">{f.text}</span>
                  </div>
                ))}
              </div>

              <Button
                onClick={() => handleSubscribe('basic')}
                disabled={isBasic || isPro || subscribeMutation.isPending}
                className="w-full h-11 font-tech uppercase bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] transition-all"
                data-testid="button-subscribe-basic"
              >
                {subscribeMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
                ) : isBasic ? (
                  <><Check className="w-4 h-4 mr-2" /> Current Plan</>
                ) : isPro ? (
                  <><Check className="w-4 h-4 mr-2" /> Included in Pro</>
                ) : (
                  <><Zap className="w-4 h-4 mr-2" /> Get Basic</>
                )}
              </Button>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="relative overflow-hidden border-2 border-yellow-500/30 bg-gradient-to-b from-yellow-500/5 to-transparent h-full flex flex-col">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-500" />
            <div className="absolute -top-0.5 right-4">
              <Badge className="bg-yellow-500 text-black font-tech text-[10px] px-2 py-0.5 rounded-t-none rounded-b-md">
                BEST VALUE
              </Badge>
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-5 h-5 text-yellow-500" />
                <h3 className="font-tech text-lg uppercase text-yellow-500">Pro</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-4">Full power - unlimited vehicles, AI, and exclusive perks</p>

              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-bold text-foreground">
                  ${isAnnual ? proAnnual : proMonthly}
                </span>
                <span className="text-muted-foreground">/{isAnnual ? 'year' : 'month'}</span>
              </div>
              {isAnnual && (
                <p className="text-xs text-muted-foreground mb-4">
                  ${(proAnnual / 12).toFixed(2)}/mo — save {proAnnualSavings}%
                </p>
              )}
              {!isAnnual && <div className="mb-4" />}

              <div className="space-y-3 mb-6 flex-1">
                {PRO_FEATURES.map((f, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-sm">
                    <div className="w-6 h-6 rounded-md bg-yellow-500/10 flex items-center justify-center text-yellow-400 shrink-0">
                      {f.icon}
                    </div>
                    <span className="text-slate-300">{f.text}</span>
                  </div>
                ))}
              </div>

              <Button
                onClick={() => handleSubscribe('pro')}
                disabled={isPro || subscribeMutation.isPending}
                className="w-full h-11 font-tech uppercase text-lg bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-black shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:shadow-[0_0_30px_rgba(234,179,8,0.5)] transition-all"
                data-testid="button-subscribe-pro"
              >
                {subscribeMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
                ) : isPro ? (
                  <><Check className="w-4 h-4 mr-2" /> Current Plan</>
                ) : (
                  <><Crown className="w-4 h-4 mr-2" /> Go Pro</>
                )}
              </Button>

              <div className="mt-3 p-2.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <p className="text-[11px] text-yellow-400 text-center">
                  <Sparkles className="w-3 h-3 inline mr-1" />
                  Founders Circle members keep this rate forever
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      <Card className="max-w-4xl mx-auto overflow-hidden">
        <div className="p-4 border-b border-border/40 glass-card">
          <h3 className="font-tech text-lg uppercase text-center">Plan Comparison</h3>
        </div>
        <div className="p-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/40">
                <th className="text-left py-2 font-medium">Feature</th>
                <th className="text-center py-2 font-medium text-slate-400">Free</th>
                <th className="text-center py-2 font-medium text-cyan-400">
                  <div className="flex items-center justify-center gap-1">
                    <Package className="w-3.5 h-3.5" /> Basic
                  </div>
                </th>
                <th className="text-center py-2 font-medium text-yellow-500">
                  <div className="flex items-center justify-center gap-1">
                    <Crown className="w-3.5 h-3.5" /> Pro
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                { feature: "Parts Search & Comparison", free: true, basic: true, pro: true },
                { feature: "DIY Guides + YouTube", free: true, basic: true, pro: true },
                { feature: "Basic Buddy AI Chat", free: true, basic: true, pro: true },
                { feature: "Ad-Free Browsing", free: false, basic: true, pro: true },
                { feature: "Marketplace Selling", free: false, basic: true, pro: true },
                { feature: "Saved Vehicles", free: "1", basic: "3", pro: "Unlimited" },
                { feature: "Genesis Hallmark", free: "$9.99", basic: "$4.99", pro: "$1.99" },
                { feature: "Price Drop Alerts", free: false, basic: false, pro: true },
                { feature: "Advanced Buddy AI", free: false, basic: false, pro: true },
                { feature: "Saved DIY Progress", free: false, basic: false, pro: true },
                { feature: "Extended Recall Monitoring", free: false, basic: false, pro: true },
                { feature: "Exclusive Deals", free: false, basic: false, pro: true },
                { feature: "Family Sharing", free: false, basic: false, pro: true },
              ].map((row, i) => (
                <tr key={i} className={`border-b border-border/20 ${typeof row.free === 'string' ? 'bg-primary/5' : ''}`}>
                  <td className="py-2.5 font-medium">{row.feature}</td>
                  {['free', 'basic', 'pro'].map((col) => {
                    const val = row[col as keyof typeof row];
                    return (
                      <td key={col} className="text-center">
                        {val === true ? (
                          <Check className="w-4 h-4 mx-auto text-green-400" />
                        ) : val === false ? (
                          <Lock className="w-4 h-4 mx-auto text-slate-600" />
                        ) : (
                          <span className={`text-xs font-semibold ${col === 'pro' ? 'text-yellow-400' : col === 'basic' ? 'text-cyan-400' : 'text-slate-400'}`}>
                            {val}
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="text-center">
        <div className="flex items-center justify-center gap-1 text-yellow-500 mb-2">
          {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
        </div>
        <p className="text-sm text-muted-foreground">
          Join the Founders Circle — be part of GarageBot's story
        </p>
      </div>

      <Card className="max-w-xl mx-auto p-6 glass-card border-border/40">
        <h4 className="font-tech uppercase text-primary mb-4">Common Questions</h4>
        <div className="space-y-4 text-sm">
          <div>
            <p className="font-medium">What's the difference between Basic and Pro?</p>
            <p className="text-muted-foreground mt-1">Basic gives you ad-free browsing and marketplace selling. Pro adds unlimited vehicles, advanced AI, price alerts, family sharing, and more.</p>
          </div>
          <div>
            <p className="font-medium">Can I upgrade from Basic to Pro later?</p>
            <p className="text-muted-foreground mt-1">Yes! You can upgrade anytime. Your Founders Circle pricing locks in from the moment you subscribe.</p>
          </div>
          <div>
            <p className="font-medium">What happens when V2 launches?</p>
            <p className="text-muted-foreground mt-1">Founders Circle members keep their current rate forever, even when prices increase.</p>
          </div>
          <div>
            <p className="font-medium">Can I cancel anytime?</p>
            <p className="text-muted-foreground mt-1">Yes! Cancel with one click in your account settings. No questions asked.</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
