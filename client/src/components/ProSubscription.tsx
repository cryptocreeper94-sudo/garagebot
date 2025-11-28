import { useState } from "react";
import { motion } from "framer-motion";
import { useMutation, useQuery } from "@tanstack/react-query";
import { 
  Crown, Check, Zap, Shield, Bell, Search, Car, Users, 
  MessageSquare, TrendingUp, Gift, Star, Lock, ArrowRight, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface ProFeature {
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: string;
}

const PRO_FEATURES: ProFeature[] = [
  {
    icon: <Search className="w-5 h-5" />,
    title: "Priority Part Search",
    description: "Your searches run first - no waiting in queue",
    badge: "Fast"
  },
  {
    icon: <Bell className="w-5 h-5" />,
    title: "Price Drop Alerts",
    description: "Get notified instantly when parts go on sale",
  },
  {
    icon: <Car className="w-5 h-5" />,
    title: "Unlimited Vehicles",
    description: "Save all your vehicles - no 3-vehicle limit",
    badge: "Popular"
  },
  {
    icon: <Users className="w-5 h-5" />,
    title: "Family Sharing",
    description: "Share vehicles with up to 10 family members",
  },
  {
    icon: <Shield className="w-5 h-5" />,
    title: "Extended Recall Monitoring",
    description: "90-day recall history and alerts for saved vehicles",
  },
  {
    icon: <TrendingUp className="w-5 h-5" />,
    title: "Price History Charts",
    description: "See if now is a good time to buy",
  },
  {
    icon: <MessageSquare className="w-5 h-5" />,
    title: "Priority Buddy Support",
    description: "Ask Buddy anything - faster, smarter responses",
    badge: "AI"
  },
  {
    icon: <Gift className="w-5 h-5" />,
    title: "Exclusive Deals",
    description: "Pro-only discounts from partner retailers",
  },
];

export default function ProSubscription() {
  const [isAnnual, setIsAnnual] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  const monthlyPrice = 2.99;
  const annualPrice = 24.99;
  const annualSavings = Math.round((monthlyPrice * 12 - annualPrice) / (monthlyPrice * 12) * 100);

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
    mutationFn: async (billingPeriod: 'monthly' | 'annual') => {
      const res = await fetch('/api/subscription/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ billingPeriod }),
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

  const handleSubscribe = () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to subscribe to Pro",
      });
      return;
    }
    subscribeMutation.mutate(isAnnual ? 'annual' : 'monthly');
  };

  const isPro = subscription?.status === 'active';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/30 mb-4">
          <Crown className="w-5 h-5 text-yellow-500" />
          <span className="font-tech text-sm uppercase text-yellow-500">GarageBot Pro</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-tech font-bold uppercase mb-3">
          Upgrade to <span className="text-gradient">Pro</span>
        </h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Get priority access, unlimited vehicles, and exclusive deals for less than a coffee per month.
        </p>
      </div>

      {/* Pricing Toggle */}
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
            Save {annualSavings}%
          </Badge>
        )}
      </div>

      {/* Pricing Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto"
      >
        <Card className="relative overflow-hidden border-2 border-primary/30 bg-gradient-to-b from-primary/5 to-transparent">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-yellow-500 to-primary" />
          
          <div className="p-6 text-center">
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-5xl font-bold text-foreground">
                ${isAnnual ? annualPrice : monthlyPrice}
              </span>
              <span className="text-muted-foreground">
                /{isAnnual ? 'year' : 'month'}
              </span>
            </div>
            
            {isAnnual && (
              <p className="text-sm text-muted-foreground mt-2">
                Just ${(annualPrice / 12).toFixed(2)}/month
              </p>
            )}

            <Button
              onClick={handleSubscribe}
              disabled={isPro || subscribeMutation.isPending}
              className="w-full mt-6 h-12 font-tech uppercase text-lg bg-gradient-to-r from-primary to-yellow-500 hover:from-primary/90 hover:to-yellow-500/90 text-black"
              data-testid="button-subscribe-pro"
            >
              {subscribeMutation.isPending ? (
                <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing...</>
              ) : isPro ? (
                <><Check className="w-5 h-5 mr-2" /> Already Pro</>
              ) : (
                <><Zap className="w-5 h-5 mr-2" /> Subscribe Now</>
              )}
            </Button>

            <p className="text-xs text-muted-foreground mt-4">
              Cancel anytime. No questions asked.
            </p>
          </div>
        </Card>
      </motion.div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
        {PRO_FEATURES.map((feature, idx) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card className="p-4 bg-card border-border/40 hover:border-primary/30 transition-colors h-full">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 shrink-0 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  {feature.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-sm">{feature.title}</h3>
                    {feature.badge && (
                      <Badge variant="outline" className="text-[10px] py-0 h-4">
                        {feature.badge}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                </div>
                <Check className="w-4 h-4 text-green-400 shrink-0" />
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Comparison Table */}
      <Card className="max-w-2xl mx-auto overflow-hidden">
        <div className="p-4 border-b border-border/40 bg-muted/30">
          <h3 className="font-tech text-lg uppercase text-center">Free vs Pro</h3>
        </div>
        <div className="p-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/40">
                <th className="text-left py-2 font-medium">Feature</th>
                <th className="text-center py-2 font-medium">Free</th>
                <th className="text-center py-2 font-medium text-primary">
                  <div className="flex items-center justify-center gap-1">
                    <Crown className="w-4 h-4 text-yellow-500" /> Pro
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/20">
                <td className="py-2">Saved Vehicles</td>
                <td className="text-center">3</td>
                <td className="text-center text-primary">Unlimited</td>
              </tr>
              <tr className="border-b border-border/20">
                <td className="py-2">Part Search</td>
                <td className="text-center">Standard</td>
                <td className="text-center text-primary">Priority</td>
              </tr>
              <tr className="border-b border-border/20">
                <td className="py-2">Family Sharing</td>
                <td className="text-center">1 person</td>
                <td className="text-center text-primary">10 people</td>
              </tr>
              <tr className="border-b border-border/20">
                <td className="py-2">Price Alerts</td>
                <td className="text-center"><Lock className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                <td className="text-center"><Check className="w-4 h-4 mx-auto text-green-400" /></td>
              </tr>
              <tr className="border-b border-border/20">
                <td className="py-2">Price History</td>
                <td className="text-center"><Lock className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                <td className="text-center"><Check className="w-4 h-4 mx-auto text-green-400" /></td>
              </tr>
              <tr>
                <td className="py-2">Exclusive Deals</td>
                <td className="text-center"><Lock className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                <td className="text-center"><Check className="w-4 h-4 mx-auto text-green-400" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* Testimonial/Trust */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-1 text-yellow-500 mb-2">
          {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
        </div>
        <p className="text-sm text-muted-foreground">
          Trusted by 1,000+ automotive enthusiasts
        </p>
      </div>

      {/* FAQ Preview */}
      <Card className="max-w-xl mx-auto p-6 bg-muted/20 border-border/40">
        <h4 className="font-tech uppercase text-primary mb-4">Common Questions</h4>
        <div className="space-y-4 text-sm">
          <div>
            <p className="font-medium">Can I cancel anytime?</p>
            <p className="text-muted-foreground mt-1">Yes! Cancel with one click in your account settings. No questions asked.</p>
          </div>
          <div>
            <p className="font-medium">Do I keep my saved vehicles if I cancel?</p>
            <p className="text-muted-foreground mt-1">Yes, you keep all your data. You just lose access to Pro features.</p>
          </div>
          <div>
            <p className="font-medium">Is there a free trial?</p>
            <p className="text-muted-foreground mt-1">The free tier gives you a great GarageBot experience. Pro is for power users who want more.</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
